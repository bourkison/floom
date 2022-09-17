import React from 'react';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {ViewStyle, Text, TextStyle, View} from 'react-native';
import {useEffect} from 'react';

type RGB = `rgb(${number}, ${number}, ${number})`;
type RGBA = `rgba(${number}, ${number}, ${number}, ${number})`;
type HEX = `#${string}`;

type Color = RGB | RGBA | HEX;

type AnimatedButtonProps = {
    onPress?: () => void;
    style: ViewStyle;
    textStyle?: ViewStyle | TextStyle;
    children: string | JSX.Element;
    scale?: number;
    disabled?: boolean;
    disabledColor?: Color;
    maxDuration?: number;
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    onPress,
    style,
    textStyle,
    children,
    scale = 0.97,
    disabled,
    disabledColor,
    maxDuration = 250,
}) => {
    const sScale = useSharedValue(1);
    const initBackgroundColor = style.backgroundColor;
    const sBackgroundColor = useSharedValue(style.backgroundColor);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: sScale.value,
                },
            ],
            backgroundColor: sBackgroundColor.value,
        };
    });

    useEffect(() => {
        if (disabled && disabledColor) {
            sBackgroundColor.value = disabledColor;
        } else if (!disabled) {
            sBackgroundColor.value = initBackgroundColor;
        }
    }, [disabled, disabledColor, initBackgroundColor, sBackgroundColor]);

    const tapGesture = Gesture.Tap()
        .maxDuration(maxDuration)
        .onTouchesDown(() => {
            if (!disabled) {
                sScale.value = scale;
                if (onPress) {
                    runOnJS(onPress)();
                }
            }
        })
        .onFinalize(() => {
            sScale.value = 1;
            if (!disabled) {
                sBackgroundColor.value = initBackgroundColor;
            }
        });

    return (
        <View>
            <GestureDetector gesture={tapGesture}>
                <Animated.View style={[style, rStyle]}>
                    {typeof children === 'string' ? (
                        <Text style={textStyle}>{children}</Text>
                    ) : (
                        children
                    )}
                </Animated.View>
            </GestureDetector>
        </View>
    );
};

export default AnimatedButton;
