import React, {useCallback, useState} from 'react';

import {SavedContext, CollectionType} from '@/context/saved';
import {convertProductToSave} from '@/services/conversions';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';

type SavedProviderProps = {
    children: React.JSX.Element;
};

const SavedProvider = ({children}: SavedProviderProps) => {
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const [hasInitiallyLoadedSaves, setHasInitiallyLoadedSaves] =
        useState(false);
    const [hasInitiallyLoadedCollections, setHasInitiallyLoadedCollections] =
        useState(false);

    const [collections, setCollections] = useState<CollectionType[]>([]);
    const [saves, setSaves] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const initFetchSaves = useCallback(async () => {
        setIsLoadingSaves(true);
        setHasInitiallyLoadedSaves(true);

        const {data, error} = await supabase
            .from('v_saves')
            .select()
            .is('collection_id', null)
            .order('created_at', {ascending: false});

        setIsLoadingSaves(false);

        if (error) {
            // TODO: Handle error.
            console.error(error);
            throw new Error(error.message);
        }

        setSaves(data);
    }, []);

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
                    const {data: saveData, error: saveError} = await supabase
                        .from('v_saves')
                        .select()
                        .eq('collection_id', collection.id)
                        .order('created_at', {ascending: false});

                    if (saveError) {
                        return reject(saveError);
                    }

                    resolve({
                        id: collection.id,
                        name: collection.name,
                        products: saveData,
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

            // TODO: Dispatch to remove from store.
        },
        [saves],
    );

    const deleteSavedProduct = useCallback(async (id: number) => {
        const {error} = await supabase.from('saves').delete().eq('id', id);

        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }, []);

    return (
        <SavedContext.Provider
            value={{
                collections,
                initFetchSaves,
                saves,
                initFetchCollections,
                isLoadingSaves,
                isLoadingCollections,
                saveProduct,
                deleteSavedProduct,
                hasInitiallyLoadedSaves,
                hasInitiallyLoadedCollections,
            }}>
            {children}
        </SavedContext.Provider>
    );
};

export default SavedProvider;
