import React, {useCallback, useState} from 'react';

import {SavedContext, CollectionType} from '@/context/saved';
import {convertProductToSave} from '@/services/conversions';
import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {unshiftProducts} from '@/store/slices/product';
import {Database} from '@/types/schema';

type SavedProviderProps = {
    children: React.JSX.Element;
};

const SavedProvider = ({children}: SavedProviderProps) => {
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [isLoadingMoreSaves, setIsLoadingMoreSaves] = useState(false);
    const [moreSavesToLoad, setMoreSavesToLoad] = useState(false);

    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const [hasInitiallyLoadedSaves, setHasInitiallyLoadedSaves] =
        useState(false);
    const [hasInitiallyLoadedCollections, setHasInitiallyLoadedCollections] =
        useState(false);

    const [collections, setCollections] = useState<CollectionType[]>([]);
    const [saves, setSaves] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const dispatch = useAppDispatch();

    const fetchSaves = useCallback(
        async (loadAmount: number, isInitialLoad: boolean = true) => {
            setHasInitiallyLoadedSaves(true);

            if (isInitialLoad) {
                setSaves([]);
                setIsLoadingSaves(true);
                setMoreSavesToLoad(true);
            } else {
                setIsLoadingMoreSaves(true);
            }

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .is('collection_id', null)
                .order('created_at', {ascending: false})
                .range(saves.length, saves.length + loadAmount - 1);

            setIsLoadingSaves(false);
            setIsLoadingMoreSaves(false);

            if (error) {
                // TODO: Handle error.
                console.error(error);
                throw new Error(error.message);
            }

            console.log('SAVES AMOUNT', data.length);

            // If saves pulled < amount we requested, then we know there are no more to load.
            if (data.length < loadAmount) {
                setMoreSavesToLoad(false);
            }

            // Ensure that there are no duplicates.
            const temp: Database['public']['Views']['v_saves']['Row'][] = [];

            data.forEach(save => {
                const duplicateIndex = saves.findIndex(s => save.id === s.id);

                if (duplicateIndex > -1) {
                    console.warn('Duplicate save found;', save.id, save.name);
                    return;
                }

                temp.push(save);
            });

            setSaves([...saves, ...temp]);
        },
        [saves],
    );

    const initFetchCollections = useCallback(async () => {
        setIsLoadingCollections(true);
        setHasInitiallyLoadedCollections(true);

        const {data: collData, error: collError} = await supabase
            .from('collections')
            .select()
            .order('created_at', {ascending: false});

        if (collError) {
            console.error('coll error', collError);
            setIsLoadingCollections(false);
            throw new Error(collError.message);
        }

        const promises: Promise<CollectionType>[] = [];

        collData.forEach(collection => {
            promises.push(
                new Promise(async (resolve, reject) => {
                    const {
                        data: saveData,
                        error: saveError,
                        count,
                    } = await supabase
                        .from('v_saves')
                        .select('*', {count: 'exact'})
                        .eq('collection_id', collection.id)
                        .order('created_at', {ascending: false})
                        .limit(1);

                    if (saveError) {
                        return reject(saveError);
                    }

                    resolve({
                        id: collection.id,
                        name: collection.name,
                        imageUrls: [saveData[0]?.images[0] || ''],
                        productsAmount: count || 0,
                    });
                }),
            );
        });

        const response = await Promise.allSettled(promises);
        const tempCollections: CollectionType[] = [];

        response.forEach(r => {
            if (r.status === 'rejected') {
                console.error('SAVES ERROR:', r.reason);
                return;
            }

            tempCollections.push(r.value);
        });

        setIsLoadingCollections(false);
        setCollections(tempCollections);
    }, []);

    const saveProduct = useCallback(
        async (product: Database['public']['Views']['v_products']['Row']) => {
            const {data, error} = await supabase
                .from('saves')
                .insert({product_id: product.id})
                .select()
                .limit(1)
                .single();

            if (error) {
                console.error(error);
                throw new Error(error.message);
            }

            setSaves([convertProductToSave(product, data), ...saves]);

            // TODO: May not want to unshift here, as products might be coming from elsewhere.
            dispatch(unshiftProducts());
        },
        [saves, dispatch],
    );

    const deleteSavedProduct = useCallback(
        async (id: number, collectionId: number | null) => {
            if (collectionId === null) {
                const index = saves.findIndex(save => save.id === id);

                if (index > -1) {
                    setSaves([
                        ...saves.slice(0, index),
                        ...saves.slice(index + 1),
                    ]);
                }
            }

            const {error} = await supabase.from('saves').delete().eq('id', id);

            if (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        [saves],
    );

    return (
        <SavedContext.Provider
            value={{
                collections,
                fetchSaves,
                saves,
                initFetchCollections,
                isLoadingSaves,
                isLoadingCollections,
                saveProduct,
                deleteSavedProduct,
                hasInitiallyLoadedSaves,
                hasInitiallyLoadedCollections,
                isLoadingMoreSaves,
                moreSavesToLoad,
            }}>
            {children}
        </SavedContext.Provider>
    );
};

export default SavedProvider;
