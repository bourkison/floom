import {createContext, useContext} from 'react';

type BottomSheetContextType = {
    openBottomSheet: (element: React.JSX.Element, snapPoint: number) => void;
    closeBottomSheet: () => void;
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
