import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ImageBackground,
    Image,
    useWindowDimensions,
    ViewStyle,
    ActivityIndicator,
} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import * as Haptics from 'expo-haptics';

import {FontAwesome5} from '@expo/vector-icons';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    runOnJS,
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {IMAGE_RATIO, PALETTE, IMAGE_PREFETCH_AMOUNT} from '@/constants';
import {capitaliseString, formatPrice, stringifyColors} from '@/services';

import {useAppDispatch} from '@/store/hooks';
import {
    COMMENCE_ANIMATE,
    DELETE_PRODUCT,
    SAVE_PRODUCT,
    SET_ACTION,
} from '@/store/slices/product';

import * as WebBrowser from 'expo-web-browser';

import BrandLogo from '@/components/Utility/BrandLogo';
import ActionButton from '@/components/Utility/ActionButton';
import ShareReportWidget from '@/components/Report/ShareReportWidget';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    const [imageIndex, setImageIndex] = useState(route.params.imageIndex || 0);
    const [prefetchedImages, setPrefetchedImages] = useState<string[]>([]);
    const {width} = useWindowDimensions();

    const context = useSharedValue(0);
    const translateY = useSharedValue(0);
    const minY = useSharedValue(0);

    const [isGoingBack, setIsGoingBack] = useState(false);

    const dispatch = useAppDispatch();

    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [loadingImageTimeout, setLoadingImageTimeout] = useState<
        NodeJS.Timer | undefined
    >();

    // Prefetch next images.
    useEffect(() => {
        for (let i = 1; i < IMAGE_PREFETCH_AMOUNT; i++) {
            const img = route.params.product.images[imageIndex + i];

            if (img && !prefetchedImages.includes(img)) {
                Image.prefetch(img);
                setPrefetchedImages(prefetched => [...prefetched, img]);
            }
        }
    }, [imageIndex, prefetchedImages, route.params.product]);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: translateY.value,
                },
            ],
        };
    });

    const calculateImageIndicator = useCallback(
        (i: number) => {
            let style: ViewStyle = JSON.parse(
                JSON.stringify(styles.selectedImageIndicator),
            );

            if (imageIndex === i) {
                style.backgroundColor = 'rgba(243, 252, 240, 0.8)';
            }

            if (i === 0) {
                style.marginLeft = 0;
            }

            if (i === route.params.product.images.length - 1) {
                style.marginRight = 0;
            }

            return style;
        },
        [imageIndex, route.params.product],
    );

    const changeImage = (amount: number) => {
        if (amount < 0 && imageIndex + amount >= 0) {
            setImageIndex(imageIndex + amount);
            Haptics.selectionAsync();
            return;
        }

        if (
            amount > 0 &&
            imageIndex + amount <= route.params.product.images.length - 1
        ) {
            setImageIndex(imageIndex + amount);
            Haptics.selectionAsync();
            return;
        }
    };

    const goBack = () => {
        if (!isGoingBack) {
            setIsGoingBack(true);
            Haptics.selectionAsync();

            const navigateOut = () => {
                // If last navigation was home, send the image index back
                // Else just pop.

                if (route.params.reference === 'swipe') {
                    navigation.navigate('Home', {imageIndex});
                } else if (route.params.reference === 'featured') {
                    navigation.navigate('Home');
                } else {
                    dispatch(SET_ACTION('idle'));
                    navigation.pop();
                }
            };

            if (translateY.value !== 0) {
                translateY.value = withTiming(0, {duration: 100}, () =>
                    runOnJS(navigateOut)(),
                );
            } else {
                navigateOut();
            }
        }
    };

    // Called on onLayout on both container and content.
    // Save state of these heights then set the minY to contentHeight - containerHeight.
    // If greater than 0 set to 0.
    const setMinY = useCallback(
        (containerHeightParam?: number, contentHeightParam?: number) => {
            if (containerHeightParam) {
                setContainerHeight(containerHeightParam);
            } else if (contentHeightParam) {
                setContentHeight(contentHeightParam);
            }

            if (containerHeight && contentHeightParam) {
                const min = -(contentHeightParam - containerHeight);
                minY.value = min > 0 ? 0 : min;
            } else if (containerHeightParam && contentHeight) {
                const min = -(contentHeight - containerHeightParam);
                minY.value = min > 0 ? 0 : min;
            }
        },
        [containerHeight, contentHeight, minY],
    );

    const panGesture = Gesture.Pan()
        .onStart(() => {
            context.value = translateY.value;
        })
        .onUpdate(e => {
            translateY.value = e.translationY + context.value;

            if (translateY.value > 0) {
                translateY.value = 0;
            } else if (translateY.value < minY.value) {
                translateY.value = minY.value;
            }
        });

    const resetTranslateY = () => {
        'worklet';
        if (translateY.value !== 0) {
            translateY.value = withTiming(0);
        }
    };

    // Only set loader after a defined amount of seconds of loading
    // To avoid loader showing up when  retrieving from cache
    const setLoader = (loading: boolean) => {
        const AMOUNT_TO_WAIT = 200;

        if (loading) {
            // Set image interval to a new timeout.
            // In this timeout, we then set it to undefined once finished and clear the interval.
            setLoadingImageTimeout(interval => {
                return setTimeout(() => {
                    setIsLoadingImage(true);
                    clearTimeout(interval);
                    setLoadingImageTimeout(undefined);
                }, AMOUNT_TO_WAIT);
            });
        } else {
            // Else just clear the current timeout and set interval to undefined
            setIsLoadingImage(false);
            clearTimeout(loadingImageTimeout);
            setLoadingImageTimeout(undefined);
        }
    };

    const ActionSection = () => {
        const commenceAnimate = (type: 'save' | 'delete') => {
            dispatch(COMMENCE_ANIMATE(type));
        };

        const deleteProduct = () => {
            if (route.params.reference === 'swipe') {
                if (translateY.value !== 0) {
                    translateY.value = withTiming(0, {duration: 150}, () => {
                        runOnJS(commenceAnimate)('delete');
                        runOnJS(goBack)();
                    });
                    return;
                } else {
                    commenceAnimate('delete');
                }
            } else {
                dispatch(DELETE_PRODUCT(route.params.product));
            }

            goBack();
        };

        const buyProduct = async () => {
            await WebBrowser.openBrowserAsync(route.params.product.link);
            dispatch(SET_ACTION('idle'));
        };

        const saveProduct = () => {
            if (route.params.reference === 'swipe') {
                if (translateY.value !== 0) {
                    translateY.value = withTiming(0, {duration: 150}, () => {
                        runOnJS(commenceAnimate)('save');
                        runOnJS(goBack)();
                        return;
                    });
                } else {
                    commenceAnimate('save');
                }
            } else {
                dispatch(SAVE_PRODUCT(route.params.product));
            }

            goBack();
        };

        return (
            <View style={styles.actionButtonContainer}>
                {!route.params.product.deleted ? (
                    <ActionButton type="delete" onPress={deleteProduct} />
                ) : undefined}
                <ActionButton type="buy" onPress={buyProduct} />
                {!route.params.product.saved ? (
                    <ActionButton type="save" onPress={saveProduct} />
                ) : undefined}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View
                style={[
                    {
                        flexBasis: width / IMAGE_RATIO,
                    },
                    styles.imageContainer,
                ]}>
                <ImageBackground
                    style={styles.imageBackground}
                    source={{
                        uri: route.params.product.images[imageIndex],
                    }}
                    onLoadStart={() => setLoader(true)}
                    onLoad={() => setLoader(false)}>
                    <View style={styles.selectedImageContainer}>
                        {route.params.product.images.map((s, index) => (
                            <View
                                style={calculateImageIndicator(index)}
                                key={index}
                            />
                        ))}
                    </View>
                    <View style={styles.imagePressableContainer}>
                        <Pressable
                            style={styles.flexOne}
                            onPress={() => {
                                changeImage(-1);
                            }}
                        />
                        <Pressable
                            style={styles.imageNonPressable}
                            onPress={() => {
                                runOnUI(resetTranslateY)();
                            }}
                        />
                        <Pressable
                            style={styles.flexOne}
                            onPress={() => {
                                changeImage(1);
                            }}
                        />
                    </View>
                    {isLoadingImage ? (
                        <ActivityIndicator style={styles.loadingImage} />
                    ) : undefined}
                </ImageBackground>
            </View>
            <View
                style={styles.flexOne}
                onLayout={({
                    nativeEvent: {
                        layout: {height},
                    },
                }) => {
                    setMinY(height, undefined);
                }}>
                <GestureDetector gesture={panGesture}>
                    <Animated.View
                        onLayout={({
                            nativeEvent: {
                                layout: {height},
                            },
                        }) => {
                            setMinY(undefined, height);
                        }}
                        style={[styles.contentContainer, rStyle]}>
                        <View style={[styles.titleButtonContainer]}>
                            <View style={styles.flexOne}>
                                <Text style={styles.title}>
                                    {capitaliseString(
                                        route.params.product.name,
                                    )}
                                </Text>
                            </View>
                            <View style={styles.downButtonContainer}>
                                <AnimatedButton
                                    onPress={goBack}
                                    style={styles.downButton}>
                                    <FontAwesome5
                                        name="long-arrow-alt-down"
                                        size={36}
                                        color="#f3fcfa"
                                    />
                                </AnimatedButton>
                            </View>
                        </View>
                        <View style={styles.priceBrandCont}>
                            <View style={styles.priceContainer}>
                                <Text style={styles.priceText}>
                                    {formatPrice(route.params.product.price)}
                                </Text>
                            </View>

                            <View style={styles.brandContainer}>
                                <BrandLogo brand={route.params.product.brand} />
                            </View>
                        </View>
                        <View style={styles.colorsContainer}>
                            <Text>
                                {stringifyColors(route.params.product.colors)} |{' '}
                                {route.params.product.inStock
                                    ? 'In stock'
                                    : 'Not in stock'}
                            </Text>
                        </View>
                        <View style={styles.descriptionContainer}>
                            {route.params.product.description ? (
                                <Text>{route.params.product.description}</Text>
                            ) : (
                                <View>
                                    <Text style={styles.noDescriptionText}>
                                        Lorem ipsum dolor sit amet consectetur
                                        adipisicing elit. Voluptatem minus ex
                                        pariatur a libero ipsa tenetur explicabo
                                        cum distinctio maiores suscipit tempore,
                                        repudiandae iure neque deserunt numquam.
                                        Exercitationem, similique distinctio?
                                    </Text>
                                    <Text style={styles.noDescriptionText}>
                                        Lorem ipsum dolor sit amet consectetur
                                        adipisicing elit. Voluptatem minus ex
                                        pariatur a libero ipsa tenetur explicabo
                                        cum distinctio maiores suscipit tempore,
                                        repudiandae iure neque deserunt numquam.
                                        Exercitationem, similique distinctio?
                                    </Text>
                                </View>
                            )}
                        </View>
                        <ActionSection />
                        <ShareReportWidget product={route.params.product} />
                    </Animated.View>
                </GestureDetector>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#f3fcfa',
        flexDirection: 'column',
        flex: 1,
    },
    imageContainer: {
        flexGrow: 0,
        flexShrink: 0,
        flex: 1,
    },
    imageBackground: {
        flex: 1,
        backgroundColor: PALETTE.neutral[2],
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
    contentContainer: {
        backgroundColor: '#f3fcfa',
        position: 'absolute',
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -4,
            width: 1,
        },
        shadowOpacity: 0.1,
        paddingBottom: 10,
        paddingHorizontal: 15,
        width: '100%',
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
        paddingBottom: 5,
    },
    downButtonContainer: {
        flex: 1,
        flexBasis: 48,
        flexGrow: 0,
        flexShrink: 0,
        marginTop: -26,
        marginRight: 15,
    },
    downButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: PALETTE.neutral[8],
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePressableContainer: {flex: 1, flexDirection: 'row'},
    imageNonPressable: {flex: 3},
    flexOne: {
        flex: 1,
    },
    titleButtonContainer: {
        flexDirection: 'row',
        flexGrow: 0,
        flexShrink: 0,
        paddingTop: 7,
    },
    priceBrandCont: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    priceContainer: {},
    priceText: {
        fontSize: 16,
    },
    brandContainer: {
        maxHeight: 24,
        paddingLeft: 10,
        flex: 1,
    },
    colorsContainer: {
        marginTop: 5,
    },
    descriptionContainer: {
        marginTop: 25,
    },
    descriptionText: {},
    noDescriptionText: {
        fontStyle: 'italic',
    },
    actionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: 33,
    },
    loadingImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default ProductView;
