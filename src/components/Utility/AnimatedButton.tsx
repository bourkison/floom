import React, {useEffect} from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {ViewStyle, Text, TextStyle, Pressable} from 'react-native';
import {Color} from '@/types';

type AnimatedButtonProps = {
    onPress?: () => void;
    style: ViewStyle;
    textStyle?: ViewStyle | TextStyle;
    children: string | JSX.Element;
    scale?: number;
    disabled?: boolean;
    disabledColor?: Color;
};

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
    onPress,
    style,
    textStyle,
    children,
    scale = 0.97,
    disabled,
    disabledColor,
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

    const pressIn = () => {
        if (!disabled) {
            sScale.value = withTiming(scale, {duration: 150});
        }
    };

    const pressOut = () => {
        sScale.value = withTiming(1, {duration: 150});

        if (onPress) {
            onPress();
        }
    };

    return (
        <Pressable onPressIn={pressIn} onPressOut={pressOut}>
            <Animated.View style={[style, rStyle]}>
                {typeof children === 'string' ? (
                    <Text style={textStyle}>{children}</Text>
                ) : (
                    children
                )}
            </Animated.View>
        </Pressable>
    );
};

export default AnimatedButton;
