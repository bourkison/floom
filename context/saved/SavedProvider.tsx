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

const MAX_STORED_SAVED_PRODUCTS = 50;

const SavedProvider = ({children}: SavedProviderProps) => {
    const [loadingSavesState, setLoadingSavesState] =
        useState<LoadingState>('idle');
    const [loadingCollectionsState, setLoadingCollectionsState] =
        useState<LoadingState>('idle');

    // const [isLoadingCollections, setIsLoadingCollections] = useState(false);

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

    // Ensure we don't overload memory by clearing up amount of
    // Saved products we have stored.
    const sliceSaves = useCallback(() => {
        if (saves.length > MAX_STORED_SAVED_PRODUCTS) {
            setSaves(saves.slice(0, MAX_STORED_SAVED_PRODUCTS));

            if (loadingSavesState === 'complete') {
                setLoadingSavesState('idle');
            }
        }
    }, [saves, loadingSavesState]);

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

            const startAt = type === 'loadMore' ? saves.length : 0;

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .is('collection_id', null)
                .order('created_at', {ascending: false})
                .range(startAt, saves.length + loadAmount - 1);

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

    const fetchCollections = useCallback(
        async (type: FetchType = 'initial') => {
            if (type === 'loadMore') {
                console.warn('Called fetchCollections with loadMore');
                return;
            }

            setHasInitiallyLoadedCollections(true);

            if (type === 'initial') {
                setCollections([]);
                setLoadingCollectionsState('load');
            } else if (type === 'refresh') {
                setLoadingCollectionsState('refresh');
            }

            const {data: collData, error: collError} = await supabase
                .from('collections')
                .select()
                .order('created_at', {ascending: false});

            if (collError) {
                console.error('coll error', collError);
                setLoadingCollectionsState('idle');
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
                            .order('updated_at', {ascending: false})
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

            setLoadingCollectionsState('idle');
            setCollections(tempCollections);
        },
        [],
    );

    const deleteSavedProductsLocally = useCallback(
        (savesToDelete: {id: number; collectionId: number | null}[]) => {
            let temp = saves;

            savesToDelete.forEach(s => {
                if (s.collectionId === null) {
                    const index = temp.findIndex(save => save.id === s.id);

                    if (index > -1) {
                        temp = [
                            ...temp.slice(0, index),
                            ...temp.slice(index + 1),
                        ];
                    }
                }
            });

            setSaves(temp);
        },
        [saves],
    );

    const addSavesToCollection = useCallback(
        async (
            savesToUpdate: Database['public']['Views']['v_saves']['Row'][],
            collectionId: number,
        ) => {
            deleteSavedProductsLocally(
                savesToUpdate.map(saveToUpdate => ({
                    id: saveToUpdate.id,
                    collectionId: null,
                })),
            );

            const collectionIndex = collections.findIndex(
                collection => collection.id === collectionId,
            );

            if (collectionIndex > -1) {
                setCollections([
                    ...collections.slice(0, collectionIndex),
                    {
                        ...collections[collectionIndex],
                        imageUrls:
                            savesToUpdate[savesToUpdate.length - 1].images,
                        productsAmount:
                            collections[collectionIndex].productsAmount +
                            savesToUpdate.length,
                    },
                    ...collections.slice(collectionIndex + 1),
                ]);
            }

            const {error} = await supabase
                .from('saves')
                .update({collection_id: collectionId})
                .in(
                    'id',
                    savesToUpdate.map(save => save.id),
                );

            if (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        [deleteSavedProductsLocally, collections],
    );

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
            sliceSaves();

            // TODO: May not want to unshift here, as products might be coming from elsewhere.
            dispatch(unshiftProducts());
        },
        [saves, dispatch, sliceSaves],
    );

    const deleteSavedProducts = useCallback(
        async (savesToDelete: {id: number; collectionId: number | null}[]) => {
            deleteSavedProductsLocally(savesToDelete);

            const {error} = await supabase
                .from('saves')
                .delete()
                .in(
                    'id',
                    savesToDelete.map(s => s.id),
                );

            if (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        [deleteSavedProductsLocally],
    );

    const createCollection = useCallback(
        async (
            input: Database['public']['Tables']['collections']['Insert'],
            selectedProducts: Database['public']['Views']['v_saves']['Row'][],
        ) => {
            // First create the collection.
            const {data: collData, error: collError} = await supabase
                .from('collections')
                .insert(input)
                .select()
                .limit(1)
                .single();

            if (collError) {
                // TODO: Handle error
                console.error('coll error', collError);
                throw new Error(collError.message);
            }

            setCollections([
                {
                    id: collData.id,
                    imageUrls: [selectedProducts[0]?.images[0] || ''],
                    name: collData.name,
                    productsAmount: selectedProducts.length,
                },
                ...collections,
            ]);

            if (!selectedProducts.length) {
                return;
            }

            const {error: saveError} = await supabase
                .from('saves')
                .update({collection_id: collData.id})
                .in(
                    'id',
                    selectedProducts.map(save => save.id),
                );

            if (saveError) {
                console.error('save error', saveError);
                throw new Error(saveError.message);
            }

            // Now remove from our products array so it doesn't show on SavedHome
            let tempArr = saves;

            selectedProducts.forEach(save => {
                const index = tempArr.findIndex(t => t.id === save.id);

                if (index < 0) {
                    return;
                }

                tempArr = [
                    ...tempArr.slice(0, index),
                    ...tempArr.slice(index + 1),
                ];
            });

            setSaves(tempArr);
        },
        [collections, saves],
    );

    return (
        <SavedContext.Provider
            value={{
                collections,
                fetchSaves,
                saves,
                fetchCollections,
                loadingCollectionsState,
                saveProduct,
                deleteSavedProducts,
                hasInitiallyLoadedSaves,
                hasInitiallyLoadedCollections,
                loadingSavesState,
                collectionsExpanded,
                setCollectionsExpanded,
                createCollection,
                sliceSaves,
                addSavesToCollection,
            }}>
            {children}
        </SavedContext.Provider>
    );
};

export default SavedProvider;
