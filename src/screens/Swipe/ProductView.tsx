import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ImageBackground,
    useWindowDimensions,
    ViewStyle,
} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import * as Haptics from 'expo-haptics';

import {FontAwesome5} from '@expo/vector-icons';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    runOnUI,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {Feather, AntDesign, Ionicons} from '@expo/vector-icons';
import {
    IMAGE_RATIO,
    DELETE_COLOR,
    BUY_COLOR,
    SAVE_COLOR,
    ACTION_BUTTON_SIZE,
} from '@/constants';
import {capitaliseString, stringifyColors} from '@/services';

import {useAppDispatch} from '@/store/hooks';
import {COMMENCE_ANIMATE} from '@/store/slices/product';

import * as WebBrowser from 'expo-web-browser';

import BrandLogo from '@/components/Product/BrandLogo';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    const [imageIndex, setImageIndex] = useState(route.params.imageIndex || 0);
    const {width} = useWindowDimensions();

    const context = useSharedValue(0);
    const translateY = useSharedValue(0);
    const minY = useSharedValue(0);

    const [previousRoute, setPreviousRoute] =
        useState<keyof MainStackParamList>('Home');
    const [isGoingBack, setIsGoingBack] = useState(false);

    const dispatch = useAppDispatch();

    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    useEffect(() => {
        const {routes} = navigation.getState();

        if (routes.length > 1) {
            setPreviousRoute(routes[routes.length - 2].name);
        }
    }, [navigation, setPreviousRoute]);

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

            // If last navigation was home, send the image index back
            // Else just pop.
            const {routes} = navigation.getState();

            if (
                routes.length > 1 &&
                routes[routes.length - 2].name === 'Home'
            ) {
                navigation.navigate('Home', {imageIndex});
            } else {
                navigation.pop();
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

    const ActionSection = () => {
        const deleteProduct = () => {
            goBack();
            dispatch(COMMENCE_ANIMATE('delete'));
        };

        const buyProduct = async () => {
            await WebBrowser.openBrowserAsync(route.params.product.link);
        };

        const saveProduct = () => {
            goBack();
            dispatch(COMMENCE_ANIMATE('save'));
        };

        if (previousRoute === 'Home') {
            return (
                <View style={styles.actionButtonContainer}>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={deleteProduct}>
                        <View style={styles.button}>
                            <Feather
                                name="x"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={DELETE_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={buyProduct}>
                        <View style={styles.button}>
                            <AntDesign
                                name="shoppingcart"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={BUY_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={saveProduct}>
                        <View style={styles.button}>
                            <Ionicons
                                name="heart"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={SAVE_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                </View>
            );
        } else {
            return (
                <View style={styles.actionButtonContainer}>
                    <AnimatedButton
                        style={styles.actionButton}
                        onPress={buyProduct}>
                        <View style={styles.button}>
                            <AntDesign
                                name="shoppingcart"
                                size={ACTION_BUTTON_SIZE / 2}
                                color={BUY_COLOR}
                            />
                        </View>
                    </AnimatedButton>
                </View>
            );
        }
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
                    }}>
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
                                    $
                                    {route.params.product.price.amount.toString()}
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
                                <Text style={styles.noDescriptionText}>
                                    No description provided
                                </Text>
                            )}
                        </View>
                        <ActionSection />
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
        backgroundColor: '#1a1f25',
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
        marginVertical: 33,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    actionButton: {
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
        backgroundColor: '#f3fcf0',
        zIndex: -1,
        elevation: 1,
        borderRadius: ACTION_BUTTON_SIZE / 2,
        width: ACTION_BUTTON_SIZE,
        height: ACTION_BUTTON_SIZE,
        marginHorizontal: 8,
    },
});

export default ProductView;
