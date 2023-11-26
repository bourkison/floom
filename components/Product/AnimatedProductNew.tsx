import * as Haptics from 'expo-haptics';
import React, {useMemo} from 'react';
import {View, StyleSheet, useWindowDimensions, Text} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    withSpring,
    runOnJS,
} from 'react-native-reanimated';

import {
    BUY_COLOR,
    BUY_TEXT,
    DELETE_COLOR,
    DELETE_TEXT,
    IMAGE_PADDING,
    IMAGE_RATIO,
    SAVE_COLOR,
    SAVE_TEXT,
} from '@/constants';
import {ACTION_THRESHOLD, OVERLAY_PERCENTAGE} from '@/constants/animations';
import {useAnimatedProductContext} from '@/context/animatedProduct';
import {useSharedSavedContext} from '@/context/saved';
import {Database} from '@/types/schema';

type AnimatedProductProps = {
    children: React.JSX.Element;
    product: Database['public']['Views']['v_products']['Row'];
};

const AnimatedProduct = ({children, product}: AnimatedProductProps) => {
    const {
        offsetX,
        offsetY,
        rotation,
        context,
        action,
        saveOpacity,
        buyOpacity,
        deleteOpacity,
    } = useAnimatedProductContext();

    const {saveProduct} = useSharedSavedContext();
    const {width} = useWindowDimensions();

    const rTileStyle = useAnimatedStyle(() => ({
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
    }));

    const rSaveStyle = useAnimatedStyle(() => ({
        opacity: saveOpacity.value,
    }));
    const rBuyStyle = useAnimatedStyle(() => ({
        opacity: buyOpacity.value,
    }));
    const rDeleteStyle = useAnimatedStyle(() => ({
        opacity: deleteOpacity.value,
    }));

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

            if (action.value === 'save') {
                runOnJS(saveProduct)(product);
            } else if (action.value === 'delete') {
                // TODO: Add delete logic.
            } else if (action.value === 'buy') {
                // TODO: Buy logic.
            } else {
                offsetX.value = withSpring(0);
                offsetY.value = withSpring(0);
            }

            action.value = 'idle';
        });

    const actionContainerPosition = useMemo(
        () => (width - IMAGE_PADDING) / IMAGE_RATIO / 2,
        [width],
    );

    return (
        <Animated.View style={rTileStyle}>
            <GestureDetector gesture={panGesture}>
                <View>
                    <View
                        style={[
                            styles.actionContainer,
                            {top: actionContainerPosition},
                        ]}>
                        <Animated.View
                            style={[
                                rSaveStyle,
                                styles.saveTextContainer,
                                {
                                    width:
                                        (width - IMAGE_PADDING) *
                                        OVERLAY_PERCENTAGE,
                                },
                            ]}>
                            <Text style={styles.saveText}>{SAVE_TEXT}</Text>
                        </Animated.View>
                    </View>

                    <View
                        style={[
                            styles.actionContainer,
                            {top: actionContainerPosition},
                        ]}>
                        <Animated.View
                            style={[
                                rDeleteStyle,
                                styles.deleteTextContainer,
                                {
                                    width:
                                        (width - IMAGE_PADDING) *
                                        OVERLAY_PERCENTAGE,
                                },
                            ]}>
                            <Text style={styles.deleteText}>{DELETE_TEXT}</Text>
                        </Animated.View>
                    </View>

                    <View
                        style={[
                            styles.actionContainer,
                            {top: actionContainerPosition},
                        ]}>
                        <Animated.View
                            style={[
                                rBuyStyle,
                                styles.buyTextContainer,
                                {
                                    width:
                                        (width - IMAGE_PADDING) *
                                        OVERLAY_PERCENTAGE,
                                },
                            ]}>
                            <Text style={styles.buyText}>{BUY_TEXT}</Text>
                        </Animated.View>
                    </View>
                    {children}
                </View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    saveTextContainer: {
        borderColor: SAVE_COLOR,
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
    },
    saveText: {
        color: SAVE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    deleteTextContainer: {
        borderColor: DELETE_COLOR,
        borderWidth: 2,
        borderRadius: 10,
        padding: 10,
        position: 'absolute',
    },
    deleteText: {
        color: DELETE_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    buyTextContainer: {
        borderColor: BUY_COLOR,
        borderWidth: 2,
        borderRadius: 10,
        paddingVertical: 10,
        position: 'absolute',
    },
    buyText: {
        color: BUY_COLOR,
        fontWeight: 'bold',
        fontSize: 24,
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    actionContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: '100%',
        width: '100%',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: 40,
    },
});

export default AnimatedProduct;
