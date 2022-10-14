import React, {useState, useMemo} from 'react';
import {ImageBackground, StyleSheet, Text, View, ViewStyle} from 'react-native';
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
import {SAVE_PRODUCT, DELETE_PRODUCT} from '@/store/slices/product';
import {useNavigation} from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';

import {IMAGE_RATIO, IMAGE_PADDING, IMAGE_GRADIENT_HEIGHT} from '@/constants';

import * as loadingImage from '@/assets/loading.png';

type ProductComponentProps = {
    product: ProductType;
    index: number;
};

const MAX_ROTATION = 10;
const ROTATION_WIDTH = 200;
const ACTION_VISIBILITY_THRESHOLD = 0.2;

const ANIMATION_DURATION = 150;

const ACTION_THRESHOLD = 150;
const SCALE_AMOUNT = 0.005;

const FALLBACK_IMAGE =
    'https://preview.redd.it/ishxhuztqlo91.jpg?width=640&crop=smart&auto=webp&s=e148af80aea3ad1ac17b54f4626852165acd193e';

const Product: React.FC<ProductComponentProps> = ({product, index}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const rotationX = useSharedValue(0);
    const rotationY = useSharedValue(0);
    const tileOpacity = useSharedValue(1);
    const saveOpacity = useSharedValue(0);
    const deleteOpacity = useSharedValue(0);
    const ctx = useSharedValue({x: 0, y: 0});

    const isActing = useSharedValue(false);

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const {width} = useWindowDimensions();

    const dispatch = useAppDispatch();
    const animationAction = useAppSelector(state => state.product.animation);
    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (index === 0 && animationAction !== 'idle') {
            runOnUI(commenceAnimation)(animationAction);
        }
        // TODO: Fix dependencies
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [animationAction]);

    const saveProduct = () => {
        dispatch(SAVE_PRODUCT(product._id));
    };

    const deleteProduct = () => {
        dispatch(DELETE_PRODUCT(product._id));
    };

    // Fade this product out and remove it from products array.
    // Called post pan gesture and after like animation.
    const fadeAndRemove = (type: typeof animationAction) => {
        'worklet';
        if (type === 'save') {
            tileOpacity.value = withTiming(0, {}, runOnJS(saveProduct));
        } else if (type === 'delete') {
            tileOpacity.value = withTiming(0, {}, runOnJS(deleteProduct));
        }
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
                () => {
                    fadeAndRemove(type);
                },
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
                () => {
                    fadeAndRemove(type);
                },
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
                {
                    rotateY: `${rotationY.value}deg`,
                },
                {
                    rotateX: `${rotationX.value}deg`,
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
        .activeOffsetX([-5, 5])
        .activeOffsetY([-5, 5])
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

            // If acting and we shouldn't be, OR if not acting and we should be
            if (
                (!isActing.value &&
                    Math.abs(offsetX.value) > ACTION_THRESHOLD) ||
                (isActing.value && Math.abs(offsetX.value) < ACTION_THRESHOLD)
            ) {
                isActing.value = !isActing.value;
                runOnJS(Haptics.selectionAsync)();
            }

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
            if (offsetX.value > ACTION_THRESHOLD) {
                // SAVE
                tileOpacity.value = withTiming(0, {}, () => {
                    fadeAndRemove('save');
                });
            } else if (offsetX.value < -ACTION_THRESHOLD) {
                // DELETE
                tileOpacity.value = withTiming(0, {}, () => {
                    fadeAndRemove('delete');
                });
            } else {
                offsetX.value = withSpring(0);
                offsetY.value = withSpring(0);
                rotation.value = withSpring(0);
                saveOpacity.value = withTiming(0);
                deleteOpacity.value = withTiming(0);
            }
        });

    const openProduct = () => {
        navigation.navigate('ProductView', {
            product: product,
        });
    };

    const touchGesture = Gesture.Tap().onTouchesUp(e => {
        const TAP_PERCENTILE = 5; // If 4, first and last quarters of the image will change image.
        const ROTATION_Y = 12;
        const ROTATION_X = 2;
        const height = (width - IMAGE_PADDING) / IMAGE_RATIO;

        if (e.allTouches[0].x < (width - IMAGE_PADDING) / TAP_PERCENTILE) {
            if (imageIndex > 0) {
                // LEFT TAP

                // Y ROTATION
                rotationY.value = withTiming(
                    -ROTATION_Y,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationY.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );

                // X ROTATION
                const yPercentage = -((e.allTouches[0].y / height) * 2 - 1);
                rotationX.value = withTiming(
                    ROTATION_X * yPercentage,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationX.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );
                runOnJS(setImageIndex)(imageIndex - 1);
                runOnJS(Haptics.selectionAsync)();
            }
        } else if (
            e.allTouches[0].x >
            ((width - IMAGE_PADDING) * (TAP_PERCENTILE - 1)) / TAP_PERCENTILE
        ) {
            if (imageIndex < product.imageLink.length - 1) {
                // RIGHT TAP

                // Y ROTATION
                rotationY.value = withTiming(
                    ROTATION_Y,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationY.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );

                // X ROTATION
                const xPercentage = (e.allTouches[0].x / height) * 2 - 1;
                rotationX.value = withTiming(
                    ROTATION_X * xPercentage,
                    {duration: ANIMATION_DURATION},
                    () => {
                        rotationX.value = withTiming(0, {
                            duration: ANIMATION_DURATION,
                        });
                    },
                );
                runOnJS(setImageIndex)(imageIndex + 1);
                runOnJS(Haptics.selectionAsync)();
            }
        } else {
            runOnJS(openProduct)();
        }
    });

    const translateY = useMemo(() => {
        const height = (width - IMAGE_PADDING) / IMAGE_RATIO;
        return -Math.floor((height * SCALE_AMOUNT * index) / 4);
    }, [index, width]);

    const calculateImageIndicator = (i: number) => {
        let style: ViewStyle = JSON.parse(
            JSON.stringify(styles.selectedImageIndicator),
        );

        if (imageIndex === i) {
            style.backgroundColor = 'rgba(243, 252, 240, 0.8)';
        }

        if (i === 0) {
            style.marginLeft = 0;
        }

        if (i === product.imageLink.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

    let baseComponent = (
        <View
            style={[
                styles.container,
                {
                    transform: [
                        {scale: 1 + index * SCALE_AMOUNT},
                        {
                            translateY: translateY,
                        },
                    ],
                },
            ]}>
            <ImageBackground
                style={[
                    styles.image,
                    {
                        width: width - IMAGE_PADDING,
                        height: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    },
                ]}
                source={{
                    uri: product.imageLink[imageIndex] || FALLBACK_IMAGE,
                }}
                loadingIndicatorSource={{uri: loadingImage}}>
                <View style={styles.selectedImageContainer}>
                    {product.imageLink.map((s, i) => (
                        <View style={calculateImageIndicator(i)} key={i} />
                    ))}
                </View>
                <View style={styles.imageOverlayContainer}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={['#00000000', '#000000']}
                            style={styles.linearGradient}>
                            <View style={styles.textContainer}>
                                <View style={styles.titleContainer}>
                                    <Text style={styles.titleText}>
                                        {product.title}
                                    </Text>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        ${product.price}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>

                    {index === 0 ? (
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

    if (index === 0) {
        return (
            <Animated.View style={rTileStyle}>
                <GestureDetector gesture={touchGesture}>
                    <GestureDetector gesture={panGesture}>
                        {baseComponent}
                    </GestureDetector>
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
    selectedImageContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        flex: 1,
        height: 8,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    selectedImageIndicator: {
        flex: 1,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(26, 31, 37, 0.3)',
        maxWidth: '33%',
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
        height: IMAGE_GRADIENT_HEIGHT,
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
    image: {
        borderRadius: 5,
        overflow: 'hidden',
    },
    titleContainer: {flex: 3},
    priceContainer: {flex: 1},
});

export default Product;
