import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {Product as ProductType} from '@/types/product';
import {LinearGradient} from 'expo-linear-gradient';
import {useWindowDimensions} from 'react-native';
import Animated, {
    runOnJS,
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {useEffect} from 'react';
import {REMOVE_TOP_PRODUCT} from '@/store/slices/product';

type ProductComponentProps = {
    product: ProductType;
    animated: boolean;
};

const IMAGE_RATIO = 0.9;
const IMAGE_PADDING = 40;
const GRADIENT_HEIGHT = 100;

const MAX_ROTATION = 10;
const ROTATION_WIDTH = 200;
const ACTION_VISIBILITY_THRESHOLD = 0.2;

const ANIMATION_DURATION = 300;

const Product: React.FC<ProductComponentProps> = ({product, animated}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const tileOpacity = useSharedValue(1);
    const saveOpacity = useSharedValue(0);
    const deleteOpacity = useSharedValue(0);
    const ctx = useSharedValue({x: 0, y: 0});

    const {width} = useWindowDimensions();

    const dispatch = useAppDispatch();
    const animationAction = useAppSelector(state => state.product.animation);

    useEffect(() => {
        if (animated && animationAction !== 'idle') {
            runOnUI(commenceAnimation)(animationAction);
        }
    }, [animationAction]);

    const removeTopProduct = () => {
        dispatch(REMOVE_TOP_PRODUCT());
    };

    // Fade this product out and remove it from products array.
    // Called post pan gesture and after like animation.
    const fadeAndRemove = () => {
        'worklet';
        tileOpacity.value = withTiming(0, {}, runOnJS(removeTopProduct));
    };

    // Called when an action button is pressed (by watching store).
    const commenceAnimation = (type: typeof animationAction) => {
        'worklet';
        if (type === 'save') {
            offsetX.value = withTiming(width * 0.75, {
                duration: ANIMATION_DURATION,
            });
            saveOpacity.value = 1;
            rotation.value = withTiming(
                MAX_ROTATION,
                {
                    duration: ANIMATION_DURATION,
                },
                fadeAndRemove,
            );
        } else if (type === 'delete') {
            offsetX.value = withTiming(-width * 0.75, {
                duration: ANIMATION_DURATION,
            });
            deleteOpacity.value = 1;
            rotation.value = withTiming(
                -MAX_ROTATION,
                {
                    duration: ANIMATION_DURATION,
                },
                fadeAndRemove,
            );
        }
    };

    const rTileStyle = useAnimatedStyle(() => {
        return {
            opacity: tileOpacity.value,
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

    const rSaveStyle = useAnimatedStyle(() => {
        return {
            opacity: saveOpacity.value,
        };
    });

    const rDeleteStyle = useAnimatedStyle(() => {
        return {
            opacity: deleteOpacity.value,
        };
    });

    const panGesture = Gesture.Pan()
        .onStart(() => {
            ctx.value = {
                x: offsetX.value,
                y: offsetY.value,
            };
        })
        .onUpdate(e => {
            offsetX.value = e.translationX + ctx.value.x;
            offsetY.value = e.translationY + ctx.value.y;

            // Calculate rotation
            let percentageToAction = e.translationX / ROTATION_WIDTH;
            if (percentageToAction > 1) {
                percentageToAction = 1;
            } else if (percentageToAction < -1) {
                percentageToAction = -1;
            }

            rotation.value = percentageToAction * MAX_ROTATION;

            if (percentageToAction > ACTION_VISIBILITY_THRESHOLD) {
                saveOpacity.value = percentageToAction;
                deleteOpacity.value = 0;
            } else if (percentageToAction < -ACTION_VISIBILITY_THRESHOLD) {
                saveOpacity.value = 0;
                deleteOpacity.value = -percentageToAction;
            } else {
                saveOpacity.value = 0;
                deleteOpacity.value = 0;
            }
        })
        .onFinalize(() => {
            const ACTION_THRESHOLD = 150;

            if (offsetX.value > ACTION_THRESHOLD) {
                // SAVE
                tileOpacity.value = withTiming(0, {}, fadeAndRemove);
            } else if (offsetX.value < -ACTION_THRESHOLD) {
                // DELETE
                tileOpacity.value = withTiming(0, {}, fadeAndRemove);
            } else {
                offsetX.value = withSpring(0);
                offsetY.value = withSpring(0);
                rotation.value = withSpring(0);
                saveOpacity.value = withTiming(0);
                deleteOpacity.value = withTiming(0);
            }
        });

    let baseComponent = (
        <View style={styles.container}>
            <ImageBackground
                style={{
                    width: width - IMAGE_PADDING,
                    height: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    borderRadius: 5,
                    overflow: 'hidden',
                }}
                source={{uri: product.imageLink[0]}}>
                <View style={styles.imageOverlayContainer}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={['#00000000', '#000000']}
                            style={styles.linearGradient}>
                            <View style={styles.textContainer}>
                                <View style={{flex: 3}}>
                                    <Text style={styles.titleText}>
                                        {product.title}
                                    </Text>
                                </View>
                                <View style={{flex: 1}}>
                                    <Text style={styles.priceText}>
                                        ${product.price}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {animated ? (
                        <View>
                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rSaveStyle,
                                        styles.saveTextContainer,
                                    ]}>
                                    <Text style={styles.saveText}>SAVE</Text>
                                </Animated.View>
                            </View>

                            <View style={styles.actionContainer}>
                                <Animated.View
                                    style={[
                                        rDeleteStyle,
                                        styles.deleteTextContainer,
                                    ]}>
                                    <Text style={styles.deleteText}>
                                        DELETE
                                    </Text>
                                </Animated.View>
                            </View>
                        </View>
                    ) : undefined}
                </View>
            </ImageBackground>
        </View>
    );

    if (animated) {
        return (
            <Animated.View style={rTileStyle}>
                <GestureDetector gesture={panGesture}>
                    {baseComponent}
                </GestureDetector>
            </Animated.View>
        );
    } else {
        return baseComponent;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
    },
    imageOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: GRADIENT_HEIGHT,
    },
    linearGradient: {
        flex: 1,
    },
    titleText: {
        color: '#f3fcf0',
    },
    priceText: {
        color: '#f3fcf0',
        textAlign: 'right',
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        padding: 10,
        flex: 1,
        flexDirection: 'row',
    },
    actionContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
    },
    saveTextContainer: {
        borderColor: 'green',
        borderWidth: 3,
        borderRadius: 10,
        padding: 5,
        position: 'absolute',
    },
    saveText: {
        color: 'green',
        fontWeight: 'bold',
        fontSize: 24,
    },
    deleteTextContainer: {
        borderColor: 'red',
        borderWidth: 3,
        borderRadius: 10,
        padding: 5,
        position: 'absolute',
    },
    deleteText: {
        color: 'red',
        fontWeight: 'bold',
        fontSize: 24,
    },
});

export default Product;
