import {Dispatch, SetStateAction, createContext, useContext} from 'react';
import {SharedValue} from 'react-native-reanimated';

import {Database} from '@/types/schema';

type BottomSheetContextType = {
    translateY: SharedValue<number>;
    setSnapPoints: Dispatch<SetStateAction<number[]>>;

    openBottomSheet: () => void;
    closeBottomSheet: () => void;

    saves: Database['public']['Views']['v_saves']['Row'][];
};

export const BottomSheetContext = createContext<BottomSheetContextType | null>(
    null,
);

export const useBottomSheetContext = () => {
    const context = useContext(BottomSheetContext);

    if (!context) {
        throw new Error(
            "'useBottomSheetContext' must be used within BottomSheetContext",
        );
    }

    return context;
};
