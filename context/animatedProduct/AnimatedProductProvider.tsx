import React from 'react';
import {useDerivedValue, useSharedValue} from 'react-native-reanimated';

import {
    ACTION_THRESHOLD,
    ActionType,
    MAX_ROTATION,
} from '@/constants/animations';
import {AnimatedProductContext} from '@/context/animatedProduct';

type AnimatedProductProviderProps = {
    children: React.JSX.Element;
};

const AnimatedProductProvider = ({children}: AnimatedProductProviderProps) => {
    const action = useSharedValue<ActionType>('idle');
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const context = useSharedValue({x: 0, y: 0});

    const rotation = useDerivedValue(() => {
        let percentageToActionX = offsetX.value / ACTION_THRESHOLD;

        if (percentageToActionX > 1) {
            percentageToActionX = 1;
        } else if (percentageToActionX < -1) {
            percentageToActionX = -1;
        }

        return percentageToActionX * MAX_ROTATION;
    });

    return (
        <AnimatedProductContext.Provider
            value={{offsetX, offsetY, rotation, context, action}}>
            {children}
        </AnimatedProductContext.Provider>
    );
};

export default AnimatedProductProvider;
