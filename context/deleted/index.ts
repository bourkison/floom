import {createContext, useContext} from 'react';

import {Database} from '@/types/schema';

type DeletedContextType = {
    deletes: Database['public']['Views']['v_deletes']['Row'][];
    initFetchDeletes: () => Promise<void>;

    deleteProduct: (
        product: Database['public']['Views']['v_products']['Row'],
    ) => Promise<void>;
    deleteDeletedProduct: (id: number) => Promise<void>;
    deleteAllDeletedProducts: () => Promise<void>;

    isLoadingDeletes: boolean;
    hasInitiallyLoadedDeletes: boolean;
};

export const DeletedContext = createContext<DeletedContextType | null>(null);

export const useDeletedContext = () => {
    const context = useContext(DeletedContext);

    if (!context) {
        throw new Error(
            "'useDeletedContext' must be used within DeletedContext",
        );
    }

    return context;
};
