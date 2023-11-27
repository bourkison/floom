import {BottomSheetModal} from '@gorhom/bottom-sheet';
import {RefObject, createContext, useContext} from 'react';

import {Database} from '@/types/schema';

type AddToCollectionContextType = {
    bottomSheetRef: RefObject<BottomSheetModal>;
    snapPoints: (string | number)[];

    saves: Database['public']['Views']['v_deletes']['Row'][];

    openModal: (
        saves: Database['public']['Views']['v_deletes']['Row'][],
    ) => void;
    closeModal: () => void;
};

export const AddToCollectionContext =
    createContext<AddToCollectionContextType | null>(null);

export const useAddToCollectionContext = () => {
    const context = useContext(AddToCollectionContext);

    if (!context) {
        throw new Error(
            "'useAddToCollectionContext' must be used within AddToCollectionContext",
        );
    }

    return context;
};
