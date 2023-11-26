import React, {useState} from 'react';
import {
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

import {
    ACTION_THRESHOLD,
    ANIMATION_DURATION,
    ActionType,
    MAX_ROTATION,
    OPACITY_MINIMUM,
    PING_DURATION,
} from '@/constants/animations';
import {AnimatedProductContext} from '@/context/animatedProduct';

type AnimatedProductProviderProps = {
    children: React.JSX.Element;
};

const AnimatedProductProvider = ({children}: AnimatedProductProviderProps) => {
    const [actionJs, setActionJs] = useState<ActionType>('idle');

    const action = useSharedValue<ActionType>('idle');
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const context = useSharedValue({x: 0, y: 0});

    const isAnimating = useSharedValue(false);

    // Pings between 0 and 1 for animations in action button.
    const savePing = useSharedValue(0);
    const deletePing = useSharedValue(0);
    const buyPing = useSharedValue(0);

    const rotation = useDerivedValue<number>(() => {
        let percentageToActionX = offsetX.value / ACTION_THRESHOLD;

        if (percentageToActionX > 1) {
            percentageToActionX = 1;
        } else if (percentageToActionX < -1) {
            percentageToActionX = -1;
        }

        return percentageToActionX * MAX_ROTATION;
    });

    const calculateOpacity = (
        x: number,
        y: number,
        act: ActionType,
    ): ActionType => {
        'worklet';

        const percentageToActionX = Math.max(
            Math.min(x / ACTION_THRESHOLD, 1),
            -1,
        ); // Clamp between -1 and 1
        const percentageToActionY = Math.min(-y / ACTION_THRESHOLD, 1);

        if (
            act === 'buy' ||
            (act === 'idle' &&
                percentageToActionY > Math.abs(percentageToActionX) &&
                percentageToActionY > OPACITY_MINIMUM)
        ) {
            return 'buy';
        }

        if (
            act === 'save' ||
            (act === 'idle' &&
                percentageToActionX > percentageToActionY &&
                percentageToActionX > OPACITY_MINIMUM)
        ) {
            return 'save';
        }

        if (
            act === 'delete' ||
            (act === 'idle' &&
                percentageToActionX < -percentageToActionY &&
                percentageToActionX < -OPACITY_MINIMUM)
        ) {
            return 'delete';
        }

        return 'idle';
    };

    const buyOpacity = useDerivedValue<number>(() => {
        if (
            calculateOpacity(offsetX.value, offsetY.value, action.value) !==
            'buy'
        ) {
            return 0;
        }

        return Math.min(-offsetY.value / ACTION_THRESHOLD, 1); // percentageToActionY
    });

    const saveOpacity = useDerivedValue<number>(() => {
        if (isAnimating.value && action.value === 'save') {
            return 1;
        }

        if (
            calculateOpacity(offsetX.value, offsetY.value, action.value) !==
            'save'
        ) {
            return 0;
        }

        return Math.min(offsetX.value / ACTION_THRESHOLD, 1);
    });

    const deleteOpacity = useDerivedValue<number>(() => {
        if (
            calculateOpacity(offsetX.value, offsetY.value, action.value) !==
            'delete'
        ) {
            return 0;
        }

        return Math.min(-offsetX.value / ACTION_THRESHOLD, 1);
    });

    const setAction = (to: ActionType) => {
        'worklet';

        const from = action.value;

        if (from === to) {
            return;
        }

        action.value = to;
        runOnJS(setActionJs)(to);

        if (from === 'buy') {
            buyPing.value = withTiming(0, {duration: PING_DURATION});
        } else if (from === 'delete') {
            deletePing.value = withTiming(0, {duration: PING_DURATION});
        } else if (from === 'save') {
            savePing.value = withTiming(0, {duration: PING_DURATION});
        }

        if (to === 'buy') {
            buyPing.value = withTiming(1, {duration: PING_DURATION});
        } else if (to === 'delete') {
            deletePing.value = withTiming(1, {duration: PING_DURATION});
        } else if (to === 'save') {
            savePing.value = withTiming(1, {duration: PING_DURATION});
        }
    };

    const animateRight = (
        amount: number,
        withReset: boolean,
        callback: () => void,
    ) => {
        setAction('save');
        isAnimating.value = true;

        offsetX.value = withTiming(
            amount,
            {duration: ANIMATION_DURATION},
            () => {
                setAction('idle');
                isAnimating.value = false;

                if (withReset) {
                    reset(false);
                }

                runOnJS(callback)();
            },
        );
    };

    const animateLeft = (
        amount: number,
        withReset: boolean,
        callback: () => void,
    ) => {
        'worklet';
        setAction('delete');
        isAnimating.value = true;

        offsetX.value = withTiming(
            -amount,
            {duration: ANIMATION_DURATION},
            () => {
                setAction('idle');
                isAnimating.value = false;

                if (withReset) {
                    reset(false);
                }

                runOnJS(callback)();
            },
        );
    };

    const animateUp = (amount: number, callback?: () => void) => {
        'worklet';
        setAction('buy');
        isAnimating.value = true;

        offsetY.value = withTiming(
            -amount,
            {duration: ANIMATION_DURATION},
            () => {
                'worklet';

                if (callback) {
                    runOnJS(callback)();
                }
            },
        );
    };

    const reset = (withAnimation: boolean) => {
        'worklet';
        setAction('idle');
        isAnimating.value = false;

        if (withAnimation) {
            offsetX.value = withSpring(0);
            offsetY.value = withSpring(0);

            return;
        }

        offsetX.value = 0;
        offsetY.value = 0;
    };

    return (
        <AnimatedProductContext.Provider
            value={{
                offsetX,
                offsetY,
                rotation,
                context,
                action,
                buyOpacity,
                saveOpacity,
                deleteOpacity,
                buyPing,
                savePing,
                deletePing,
                setAction,
                actionJs,
                animateRight,
                animateLeft,
                reset,
                animateUp,
            }}>
            {children}
        </AnimatedProductContext.Provider>
    );
};

export default AnimatedProductProvider;
