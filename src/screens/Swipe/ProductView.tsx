import React, {useCallback, useState} from 'react';
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

import {IMAGE_RATIO} from '@/constants';
import {FontAwesome5} from '@expo/vector-icons';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    const [imageIndex, setImageIndex] = useState(route.params.imageIndex || 0);
    const {width} = useWindowDimensions();

    const context = useSharedValue(0);
    const translateY = useSharedValue(0);
    const minY = useSharedValue(0);

    const [containerHeight, setContainerHeight] = useState(0);
    const [contentHeight, setContentHeight] = useState(0);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateY: translateY.value,
                },
            ],
        };
    });

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

        if (i === route.params.product.images.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

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
        Haptics.selectionAsync();
        navigation.pop();
    };

    // Called on onLayout on both container and content.
    // Save state of these heights then set the minY to contentHeight - containerHeight.
    const setMinY = useCallback(
        (containerHeightParam?: number, contentHeightParam?: number) => {
            if (containerHeightParam) {
                setContainerHeight(containerHeightParam);
            } else if (contentHeightParam) {
                setContentHeight(contentHeightParam);
            }

            if (containerHeight && contentHeightParam) {
                minY.value = -(contentHeightParam - containerHeight);
                console.log(
                    'CONTENT MIN Y SET:',
                    minY.value,
                    contentHeightParam,
                    containerHeight,
                );
            } else if (containerHeightParam && contentHeight) {
                minY.value = -(contentHeight - containerHeightParam);
                console.log(
                    'CONTAINER MIN Y SET:',
                    minY.value,
                    contentHeight,
                    containerHeightParam,
                );
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

            console.log(minY.value);
        });

    const resetTranslateY = () => {
        'worklet';
        if (translateY.value !== 0) {
            translateY.value = withTiming(0);
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
                            onPress={resetTranslateY}
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
                                    {route.params.product.name}
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
                        <View>
                            <Text>{JSON.stringify(route.params.product)}</Text>
                        </View>
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
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.1,
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
        marginTop: -24,
        marginRight: 20,
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
    },
});

export default ProductView;
