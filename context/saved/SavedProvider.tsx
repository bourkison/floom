import React, {useCallback, useState} from 'react';

import {
    SavedContext,
    CollectionType,
    FetchType,
    LoadingState,
} from '@/context/saved';
import {convertProductToSave} from '@/services/conversions';
import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {unshiftProducts} from '@/store/slices/product';
import {Database} from '@/types/schema';

type SavedProviderProps = {
    children: React.JSX.Element;
};

const SavedProvider = ({children}: SavedProviderProps) => {
    const [loadingSavesState, setLoadingSavesState] =
        useState<LoadingState>('idle');

    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const [hasInitiallyLoadedSaves, setHasInitiallyLoadedSaves] =
        useState(false);
    const [hasInitiallyLoadedCollections, setHasInitiallyLoadedCollections] =
        useState(false);

    const [collections, setCollections] = useState<CollectionType[]>([]);
    const [saves, setSaves] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const [collectionsExpanded, setCollectionsExpanded] = useState(false);

    const dispatch = useAppDispatch();

    const fetchSaves = useCallback(
        async (loadAmount: number, type: FetchType = 'initial') => {
            setHasInitiallyLoadedSaves(true);

            if (type === 'initial') {
                setSaves([]);
                setLoadingSavesState('load');
            } else if (type === 'refresh') {
                setLoadingSavesState('refresh');
            } else if (type === 'loadMore') {
                if (loadingSavesState === 'complete') {
                    console.warn(
                        'Attempted to load more saves when all loaded in.',
                    );
                    return;
                }

                setLoadingSavesState('additional');
            }

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .is('collection_id', null)
                .order('created_at', {ascending: false})
                .range(saves.length, saves.length + loadAmount - 1);

            setLoadingSavesState('idle');

            if (error) {
                // TODO: Handle error.
                console.error(error);
                throw new Error(error.message);
            }

            // If saves pulled < amount we requested, then we know there are no more to load.
            if (data.length < loadAmount) {
                setLoadingSavesState('complete');
            }

            if (type === 'refresh' || type === 'initial') {
                setSaves(data);
                return;
            }

            // Ensure that there are no duplicates when adding in additional.
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
        [saves, loadingSavesState],
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
                isLoadingCollections,
                saveProduct,
                deleteSavedProduct,
                hasInitiallyLoadedSaves,
                hasInitiallyLoadedCollections,
                loadingSavesState,
                collectionsExpanded,
                setCollectionsExpanded,
            }}>
            {children}
        </SavedContext.Provider>
    );
};

export default SavedProvider;
