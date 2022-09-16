import React from 'react';
import {ImageBackground, StyleSheet, Text, View} from 'react-native';
import {Product as ProductType} from '@/types/Product';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {LinearGradient} from 'expo-linear-gradient';

type ProductComponentProps = {
    product: ProductType;
    onSave: () => void;
};

const Product: React.FC<ProductComponentProps> = ({product, onSave}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const rotation = useSharedValue(0);
    const opacity = useSharedValue(1);
    const ctx = useSharedValue({x: 0, y: 0});

    const rStyle = useAnimatedStyle(() => {
        return {
            opacity: opacity.value,
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
            const MAX_ROTATION = 15;
            const ROTATION_WIDTH = 300;

            let rot = (e.translationX / ROTATION_WIDTH) * MAX_ROTATION;
            if (rot > ROTATION_WIDTH) {
                rot = ROTATION_WIDTH;
            } else if (rot < -ROTATION_WIDTH) {
                rot = -ROTATION_WIDTH;
            }

            rotation.value = rot;
        })
        .onFinalize(() => {
            const ACTION_THRESHOLD = 200;

            if (offsetX.value > ACTION_THRESHOLD) {
                // SAVE
                opacity.value = withTiming(0, {}, runOnJS(onSave));
            } else if (offsetX.value < -ACTION_THRESHOLD) {
                // DELETE
                opacity.value = withTiming(0, {}, runOnJS(onSave));
            } else {
                offsetX.value = withSpring(0);
                offsetY.value = withSpring(0);
                rotation.value = withSpring(0);
            }
        });

    return (
        <Animated.View style={[rStyle, styles.container]}>
            <GestureDetector gesture={panGesture}>
                <View>
                    <ImageBackground
                        style={styles.image}
                        source={{uri: product.imageLink[0]}}>
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
                    </ImageBackground>
                </View>
            </GestureDetector>
        </Animated.View>
    );
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
    image: {
        width: 300,
        height: 300,
    },
    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: 100,
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
});

export default Product;
