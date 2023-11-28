import {Dispatch, SetStateAction, createContext, useContext} from 'react';

import {Database} from '@/types/schema';

export type CollectionType = {
    name: string;
    id: number;
    imageUrls: string[];
    productsAmount: number;
};

export type FetchType = 'initial' | 'loadMore' | 'refresh';
export type LoadingState =
    | 'idle'
    | 'load'
    | 'additional'
    | 'refresh'
    | 'complete';

type SavedContextType = {
    collections: CollectionType[];
    saves: Database['public']['Views']['v_saves']['Row'][];
    fetchSaves: (loadAmount: number, type?: FetchType) => Promise<void>;
    fetchCollections: (type?: FetchType) => Promise<void>;

    saveProduct: (
        product: Database['public']['Views']['v_products']['Row'],
    ) => Promise<void>;
    deleteSavedProducts: (
        savesToDelete: {id: number; collectionId: number | null}[],
    ) => Promise<void>;

    loadingSavesState: LoadingState;
    loadingCollectionsState: LoadingState;

    hasInitiallyLoadedSaves: boolean;
    hasInitiallyLoadedCollections: boolean;

    collectionsExpanded: boolean;
    setCollectionsExpanded: Dispatch<SetStateAction<boolean>>;
    addSavesToCollection: (
        savesToUpdate: Database['public']['Views']['v_saves']['Row'][],
        collectionId: number,
    ) => Promise<void>;

    sliceSaves: () => void;

    createCollection: (
        input: Database['public']['Tables']['collections']['Insert'],
        selectedProducts: Database['public']['Views']['v_saves']['Row'][],
    ) => Promise<void>;
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
