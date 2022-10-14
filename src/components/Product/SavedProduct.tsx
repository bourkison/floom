import React from 'react';
import {View, Text, StyleSheet, useWindowDimensions} from 'react-native';
import {Product as ProductType} from '@/types/product';
import * as Haptics from 'expo-haptics';

import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {GestureDetector, Gesture} from 'react-native-gesture-handler';
import {useNavigation} from '@react-navigation/native';

import {useAppDispatch} from '@/store/hooks';
import {DELETE_SAVED_PRODUCT} from '@/store/slices/product';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';

export type SavedProductProps = {
    product: ProductType;
    index: number;
};

const ITEM_HEIGHT = 72;
const SNAP_ANIMATION_DURATION = 250;
const SNAP_TO_DELETE_TRANSLATION = 7 / 8;

const SavedProduct: React.FC<SavedProductProps> = ({product, index}) => {
    const contextX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const sHeight = useSharedValue(ITEM_HEIGHT);

    const isDeleting = useSharedValue(false);
    const isAnimating = useSharedValue(false);

    const {width} = useWindowDimensions();
    const dispatch = useAppDispatch();

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: offsetX.value,
                },
            ],
            height: sHeight.value,
        };
    });

    const rDelStyle = useAnimatedStyle(() => {
        return {
            height: sHeight.value,
        };
    });

    const deleteProduct = () => {
        dispatch(DELETE_SAVED_PRODUCT({_id: product._id, index}));
    };

    const navigateToProduct = () => {
        navigation.navigate('ProductView', {
            product: product,
        });
    };

    const panGesture = Gesture.Pan()
        .activeOffsetX(-10)
        .failOffsetY([-10, 10])
        .onStart(() => {
            contextX.value = offsetX.value;
        })
        .onUpdate(e => {
            if (!isAnimating.value) {
                let v = e.translationX + contextX.value;

                if (v > 0) {
                    return;
                } else if (v < -width / 2 && !isDeleting.value) {
                    // Snap to delete.
                    isDeleting.value = true;
                    isAnimating.value = true;
                    offsetX.value = withTiming(
                        -width * SNAP_TO_DELETE_TRANSLATION,
                        {duration: SNAP_ANIMATION_DURATION},
                        () => {
                            isAnimating.value = false;
                        },
                    );
                    runOnJS(Haptics.selectionAsync)();
                } else if (v > -width / 2 + 1 && isDeleting.value) {
                    // Disable snap to delete.
                    isDeleting.value = false;
                    isAnimating.value = true;
                    offsetX.value = withTiming(
                        v,
                        {duration: SNAP_ANIMATION_DURATION},
                        () => {
                            isAnimating.value = false;
                        },
                    );
                    runOnJS(Haptics.selectionAsync)();
                } else if (!isDeleting.value) {
                    // Run normally if not snapped.
                    offsetX.value = v;
                }
            }
        })
        .onEnd(e => {
            if (isDeleting.value && e.state === 5) {
                // Run delete animation and remove from the store.
                offsetX.value = withTiming(-width, {}, () => {
                    sHeight.value = withTiming(0, {}, () => {
                        runOnJS(deleteProduct)();
                    });
                });
            } else {
                offsetX.value = withSpring(0);
            }
        });

    const touchGesture = Gesture.Tap()
        .maxDuration(250)
        .onTouchesDown(() => {
            // TODO: Change background color of item for user feedback
        })
        .onTouchesUp(() => {
            runOnJS(navigateToProduct)();
        });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.deleteContainer, rDelStyle]}>
                <Text style={styles.deleteText}>Delete</Text>
            </Animated.View>
            <Animated.View
                style={[
                    styles.animatedContainer,
                    index === 0 ? styles.animatedZeroContainer : undefined,
                    rStyle,
                ]}>
                <GestureDetector gesture={panGesture}>
                    <GestureDetector gesture={touchGesture}>
                        <View style={styles.flexOne}>
                            <Text>{product.title}</Text>
                        </View>
                    </GestureDetector>
                </GestureDetector>
            </Animated.View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#00000011',
        justifyContent: 'flex-start',
        alignContent: 'flex-start',
    },
    flexOne: {
        flex: 1,
    },
    animatedContainer: {
        borderBottomColor: '#1a1f25',
        borderBottomWidth: 1,
        backgroundColor: '#f3fcf0',
    },
    deleteContainer: {
        position: 'absolute',
        height: '100%',
        width: '100%',
        backgroundColor: '#CF3C48',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    deleteText: {
        color: '#f3fcf0',
        marginRight: 10,
        fontWeight: 'bold',
        fontSize: 12,
    },
    animatedZeroContainer: {
        borderTopColor: '#1a1f25',
        borderTopWidth: 1,
    },
});

export default SavedProduct;
