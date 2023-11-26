import {createContext, useContext} from 'react';
import {SharedValue} from 'react-native-reanimated';

import {ActionType} from '@/constants/animations';

type AnimatedProductType = {
    offsetX: SharedValue<number>;
    offsetY: SharedValue<number>;
    rotation: SharedValue<number>;
    context: SharedValue<{x: number; y: number}>;
    action: SharedValue<ActionType>;
    buyOpacity: SharedValue<number>;
    saveOpacity: SharedValue<number>;
    deleteOpacity: SharedValue<number>;

    actionJs: ActionType;

    buyPing: SharedValue<number>;
    savePing: SharedValue<number>;
    deletePing: SharedValue<number>;

    setAction: (to: ActionType) => void;
    animateRight: (
        amount: number,
        withReset: boolean,
        callback: () => void,
    ) => void;
    animateLeft: (
        amount: number,
        withReset: boolean,
        callback: () => void,
    ) => void;
    animateUp: (amount: number, callback?: () => void) => void;
    reset: (withAnimation: boolean) => void;
};

export const AnimatedProductContext = createContext<AnimatedProductType | null>(
    null,
);

export const useAnimatedProductContext = () => {
    const context = useContext(AnimatedProductContext);

    if (!context) {
        throw new Error(
            "'useAnimatedProductContext' must be within AnimatedProductContext",
        );
    }

    return context;
};
