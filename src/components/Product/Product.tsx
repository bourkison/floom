import React from 'react';
import {Image, StyleSheet, Text, View} from 'react-native';
import {Product as ProductType} from '@/types/Product';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';

type ProductComponentProps = {
    product: ProductType;
};

const Product: React.FC<ProductComponentProps> = ({product}) => {
    const offsetX = useSharedValue(0);
    const offsetY = useSharedValue(0);
    const ctx = useSharedValue({x: 0, y: 0});

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    translateX: offsetX.value,
                },
                {
                    translateY: offsetY.value,
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
        })
        .onFinalize(() => {
            offsetX.value = withSpring(0);
            offsetY.value = withSpring(0);
        });

    return (
        <Animated.View style={[rStyle, styles.container]}>
            <GestureDetector gesture={panGesture}>
                <Image
                    style={styles.image}
                    source={{uri: product.imageLink[0]}}
                />
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
});

export default Product;
