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

import {useAppDispatch} from '@/store/hooks';
import {REMOVE_SAVED_PRODUCT} from '@/store/slices/product';

type SavedProductProps = {
    product: ProductType;
    index: number;
};

const ITEM_HEIGHT = 72;

const SavedProduct: React.FC<SavedProductProps> = ({product, index}) => {
    const contextX = useSharedValue(0);
    const offsetX = useSharedValue(0);
    const sHeight = useSharedValue(ITEM_HEIGHT);

    const isDeleting = useSharedValue(false);
    const isAnimating = useSharedValue(false);

    const {width} = useWindowDimensions();
    const dispatch = useAppDispatch();

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
        dispatch(REMOVE_SAVED_PRODUCT(index));
    };

    const panGesture = Gesture.Pan()
        .onStart(() => {
            contextX.value = offsetX.value;
        })
        .onUpdate(e => {
            if (!isAnimating.value) {
                let v = e.translationX + contextX.value;

                if (v < -width / 2 && !isDeleting.value) {
                    // Snap to delete.
                    isDeleting.value = true;
                    isAnimating.value = true;
                    offsetX.value = withTiming((-width / 8) * 7, {}, () => {
                        isAnimating.value = false;
                    });
                    runOnJS(Haptics.selectionAsync)();
                } else if (v > -width / 2 + 1 && isDeleting.value) {
                    // Disable snap to delete.
                    isDeleting.value = false;
                    isAnimating.value = true;
                    offsetX.value = withTiming(v, {}, () => {
                        isDeleting.value = false;
                        isAnimating.value = false;
                    });
                    runOnJS(Haptics.selectionAsync)();
                } else if (!isDeleting.value) {
                    // Run normally if not snapped.
                    offsetX.value = v;
                }
            }
        })
        .onEnd(() => {
            if (isDeleting.value) {
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

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.deleteContainer, rDelStyle]}>
                <Text style={styles.deleteText}>Delete</Text>
            </Animated.View>
            <Animated.View
                style={[
                    styles.animatedContainer,
                    index === 0
                        ? {borderTopColor: '#1a1f25', borderTopWidth: 1}
                        : undefined,
                    rStyle,
                ]}>
                <GestureDetector gesture={panGesture}>
                    <View style={{flex: 1}}>
                        <Text>{product.title}</Text>
                    </View>
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
});

export default SavedProduct;
