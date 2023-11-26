import * as Haptics from 'expo-haptics';
import React from 'react';
// import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

import {ACTION_THRESHOLD} from '@/constants/animations';
import {useAnimatedProductContext} from '@/context/animatedProduct';

type AnimatedProductProps = {
    children: React.JSX.Element;
};

const AnimatedProduct = ({children}: AnimatedProductProps) => {
    const {offsetX, offsetY, rotation, context, action} =
        useAnimatedProductContext();

    const rTileStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: offsetX.value,
                },
                {
                    translateY: offsetY.value,
                },
                {
                    rotateZ: `${rotation.value}deg`,
                },
            ],
        };
    });

    const panGesture = Gesture.Pan()
        .activeOffsetX([-5, 5])
        .activeOffsetY([-5, 5])
        .onStart(() => {
            context.value = {
                x: offsetX.value,
                y: offsetY.value,
            };
        })
        .onUpdate(e => {
            offsetX.value = e.translationX + context.value.x;
            offsetY.value = e.translationY + context.value.y;

            // NOT DERIVED SO WE CAN RUN HAPTICS ON CHANGE.
            // If we're not idle and we should be (i.e. within the action thresholds).
            if (
                action.value !== 'idle' &&
                Math.abs(offsetX.value) < ACTION_THRESHOLD &&
                -offsetY.value < ACTION_THRESHOLD
            ) {
                action.value = 'idle';
                runOnJS(Haptics.impactAsync)();
            }
            // else if we're not buying and we should be (i.e. offsetY value above 2x action threshold)
            else if (
                action.value !== 'buy' &&
                -offsetY.value >= ACTION_THRESHOLD &&
                offsetX.value < ACTION_THRESHOLD &&
                offsetX.value > -ACTION_THRESHOLD
            ) {
                action.value = 'buy';
                runOnJS(Haptics.impactAsync)();
            }
            // else if we're not saving and we should be (i.e. offsetX value above action threshold)
            else if (
                action.value !== 'save' &&
                offsetX.value >= ACTION_THRESHOLD
            ) {
                action.value = 'save';
                runOnJS(Haptics.impactAsync)();
            }
            // finally, if we're not deleting and we should be (i.e. offsetX value below action threshold)
            else if (
                action.value !== 'delete' &&
                offsetX.value <= -ACTION_THRESHOLD
            ) {
                action.value = 'delete';
                runOnJS(Haptics.impactAsync)();
            }
        })
        .onFinalize(() => {
            console.log(action.value);

            offsetX.value = withSpring(0);
            offsetY.value = withSpring(0);
        });

    return (
        <Animated.View style={rTileStyle}>
            <GestureDetector gesture={panGesture}>{children}</GestureDetector>
        </Animated.View>
    );
};

export default AnimatedProduct;
