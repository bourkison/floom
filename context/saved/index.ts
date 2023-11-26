import {createContext, useContext} from 'react';

import {Database} from '@/types/schema';

export type CollectionType = {
    name: string;
    id: number;
    imageUrls: string[];
    productsAmount: number;
};

type SavedContextType = {
    collections: CollectionType[];
    saves: Database['public']['Views']['v_saves']['Row'][];
    fetchSaves: (loadAmount: number, isInitialLoad?: boolean) => Promise<void>;
    initFetchCollections: () => Promise<void>;

    saveProduct: (
        product: Database['public']['Views']['v_products']['Row'],
    ) => Promise<void>;
    deleteSavedProduct: (
        id: number,
        collectionId: number | null,
    ) => Promise<void>;

    isLoadingSaves: boolean;
    isLoadingMoreSaves: boolean;
    moreSavesToLoad: boolean;

    isLoadingCollections: boolean;

    hasInitiallyLoadedSaves: boolean;
    hasInitiallyLoadedCollections: boolean;
};

export const SavedContext = createContext<SavedContextType | null>(null);

export const useSharedSavedContext = () => {
    const context = useContext(SavedContext);

    if (!context) {
        throw new Error(
            "'useSharedSavedContext' must be used within SavedContext",
        );
    }

    return context;
};
