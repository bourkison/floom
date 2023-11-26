import {createContext, useContext} from 'react';

import {Database} from '@/types/schema';

export type CollectionType = {
    name: string;
    id: number;
    products: Database['public']['Views']['v_saves']['Row'][];
};

type SavedContextType = {
    collections: CollectionType[];
    saves: Database['public']['Views']['v_saves']['Row'][];
    initFetchSaves: () => Promise<void>;
    initFetchCollections: () => Promise<void>;

    isLoadingSaves: boolean;
    isLoadingCollections: boolean;
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
