import React from 'react';
import {
    ViewStyle,
    Text,
    TextStyle,
    Pressable,
    View,
    StyleSheet,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

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

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: sScale.value,
                },
            ],
        };
    });

    const pressIn = () => {
        sScale.value = withTiming(scale, {duration: 150});
    };

    const pressOut = () => {
        sScale.value = withTiming(1, {duration: 150});
    };

    return (
        <Pressable
            onPressIn={pressIn}
            onPressOut={pressOut}
            onPress={onPress}
            disabled={disabled}>
            <Animated.View style={[style, rStyle, styles.paddingsRemoved]}>
                <View
                    style={[
                        style,
                        disabled && disabledColor
                            ? {backgroundColor: disabledColor}
                            : undefined,
                    ]}>
                    {typeof children === 'string' ? (
                        <Text style={textStyle}>{children}</Text>
                    ) : (
                        children
                    )}
                </View>
            </Animated.View>
        </Pressable>
    );
};

const styles = StyleSheet.create({
    paddingsRemoved: {
        padding: 0,
        paddingHorizontal: 0,
        paddingVertical: 0,
        paddingLeft: 0,
        paddingRight: 0,
        paddingTop: 0,
        paddingBottom: 0,
        margin: 0,
        marginHorizontal: 0,
        marginVertical: 0,
        marginLeft: 0,
        marginRight: 0,
        marginTop: 0,
        marginBottom: 0,
        borderWidth: 0,
        borderTopWidth: 0,
        borderBottomWidth: 0,
        borderLeftWidth: 0,
        borderRightWidget: 0,
    },
});

export default AnimatedButton;
