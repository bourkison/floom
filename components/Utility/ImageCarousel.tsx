import React, {useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {
    Extrapolation,
    interpolate,
    Easing,
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import ImageIndicator from '@/components/Utility/ImageIndicator';

type ImageCarouselProps = {
    images: string[];
    width: number;
    height: number;
};

const CLAMP_SPRING_MODIFIER = 0.4;
const FLICK_VELOCITY = 1000;

const ImageCarousel = ({images, width, height}: ImageCarouselProps) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    const translateX = useSharedValue(0);
    const contextX = useSharedValue(0);

    const panGesture = Gesture.Pan()
        .activeOffsetX([-30, 30])
        .onStart(() => {
            contextX.value = translateX.value;
        })
        .onUpdate(e => {
            const endTranslateX = -((images.length - 1) * width);

            // Clamp translateX value.
            translateX.value = interpolate(
                e.translationX + contextX.value,
                [endTranslateX - width, endTranslateX, 0, width],
                [
                    endTranslateX - width * CLAMP_SPRING_MODIFIER,
                    endTranslateX,
                    0,
                    width * CLAMP_SPRING_MODIFIER,
                ],
                Extrapolation.CLAMP,
            );
        })
        .onFinalize(e => {
            let targetIndex = -1;

            // First check velocity to see if this is a flick.
            if (
                e.velocityX < -FLICK_VELOCITY &&
                selectedImageIndex < images.length - 1
            ) {
                targetIndex = selectedImageIndex + 1;
            } else if (e.velocityX > FLICK_VELOCITY && selectedImageIndex > 0) {
                targetIndex = selectedImageIndex - 1;
            }

            if (targetIndex > -1) {
                const targetTranslationX = targetIndex * -width;

                translateX.value = withTiming(targetTranslationX, {
                    duration: 150,
                    easing: Easing.inOut(Easing.quad),
                });
                runOnJS(setSelectedImageIndex)(targetIndex);
                return;
            }

            // If we weren't flicking fast enough, animate to nearest image.
            // TODO: A better way to do would just be to check -1 and +1 index.
            let closestIndex = 0;
            let closestPosition = 0;
            let closestDifference = width;

            for (let i = 0; i < images.length; i++) {
                const xPosition = i * -width;
                const positionDifference = Math.abs(
                    xPosition - translateX.value,
                );

                if (positionDifference < closestDifference) {
                    closestIndex = i;
                    closestPosition = xPosition;
                    closestDifference = positionDifference;
                }
            }

            translateX.value = withTiming(closestPosition);
            runOnJS(setSelectedImageIndex)(closestIndex);
        });

    const rStyle = useAnimatedStyle(() => ({
        transform: [{translateX: translateX.value}],
    }));

    return (
        <View>
            <GestureDetector gesture={panGesture}>
                <Animated.View style={[styles.imagesContainer, rStyle]}>
                    {images.map((image, index) => (
                        <Image
                            style={{width, height}}
                            source={{uri: image}}
                            key={index}
                        />
                    ))}
                </Animated.View>
            </GestureDetector>
            <View style={styles.imageIndicatorContainer}>
                <ImageIndicator
                    amount={images.length}
                    selectedIndex={selectedImageIndex}
                />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    imagesContainer: {
        flexDirection: 'row',
    },
    imageIndicatorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
});

export default ImageCarousel;
