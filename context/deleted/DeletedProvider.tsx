import React, {useCallback, useState} from 'react';

import {DeletedContext} from '@/context/deleted';
import {convertProductToDelete} from '@/services/conversions';
import {supabase} from '@/services/supabase';
import {useAppDispatch} from '@/store/hooks';
import {unshiftProducts} from '@/store/slices/product';
import {Database} from '@/types/schema';

type DeletedProviderProps = {
    children: React.JSX.Element;
};

const DeletedProvider = ({children}: DeletedProviderProps) => {
    const [deletes, setDeletes] = useState<
        Database['public']['Views']['v_deletes']['Row'][]
    >([]);

    const [isLoadingDeletes, setIsLoadingDeletes] = useState(false);
    const [hasInitiallyLoadedDeletes, setHasInitiallyLoadedDeletes] =
        useState(false);

    const dispatch = useAppDispatch();

    const initFetchDeletes = useCallback(async () => {
        setIsLoadingDeletes(true);
        setHasInitiallyLoadedDeletes(true);

        const {data, error} = await supabase
            .from('v_deletes')
            .select()
            .order('created_at', {ascending: false});

        setIsLoadingDeletes(false);

        if (error) {
            // TODO: Handle error.
            console.error(error);
            throw new Error(error.message);
        }

        setDeletes(data);
    }, []);

    const deleteProduct = useCallback(
        async (product: Database['public']['Views']['v_products']['Row']) => {
            const {data, error} = await supabase
                .from('deletes')
                .insert({product_id: product.id})
                .select()
                .limit(1)
                .single();

            if (error) {
                // TODO: Handle error
                console.error(error);
                throw new Error(error.message);
            }

            setDeletes([convertProductToDelete(product, data), ...deletes]);

            // TODO: May not want to unshift here, as products might be coming from elsewhere.
            dispatch(unshiftProducts());
        },
        [deletes, dispatch],
    );

    const deleteDeletedProduct = useCallback(
        async (id: number) => {
            const index = deletes.findIndex(del => del.id === id);

            if (index > -1) {
                setDeletes([
                    ...deletes.slice(0, index),
                    ...deletes.slice(index + 1),
                ]);
            }

            const {error} = await supabase
                .from('deletes')
                .delete()
                .eq('id', id);

            if (error) {
                console.error(error);
                throw new Error(error.message);
            }
        },
        [deletes],
    );

    const deleteAllDeletedProducts = useCallback(async () => {
        const {error} = await supabase.from('deletes').delete();

        if (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }, []);

    return (
        <DeletedContext.Provider
            value={{
                initFetchDeletes,
                deleteProduct,
                deleteDeletedProduct,
                deleteAllDeletedProducts,
                isLoadingDeletes,
                hasInitiallyLoadedDeletes,
                deletes,
            }}>
            {children}
        </DeletedContext.Provider>
    );
};

export default DeletedProvider;
