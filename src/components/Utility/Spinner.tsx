import React, {useEffect} from 'react';

import {View, StyleSheet, ViewStyle} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
    cancelAnimation,
    Easing,
} from 'react-native-reanimated';

type SpinnerProps = {
    style?: ViewStyle;
    diameter: number;
    spinnerWidth: number;
    backgroundColor: string;
    spinnerColor: string;
};

const Spinner: React.FC<SpinnerProps> = ({
    style = {},
    backgroundColor = '#f5f5f5',
    spinnerColor = 'black',
    diameter = 30,
    spinnerWidth = 3,
}) => {
    const rotation = useSharedValue(0);

    const animatedStyles = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    rotateZ: `${rotation.value}deg`,
                },
            ],
        };
    }, [rotation.value]);

    useEffect(() => {
        rotation.value = withRepeat(
            withTiming(360, {
                duration: 1000,
                easing: Easing.linear,
            }),
            -1,
        );

        return () => cancelAnimation(rotation);
    }, [rotation]);

    const styles = StyleSheet.create({
        container: style,
        spinner: {
            height: diameter,
            width: diameter,
            borderRadius: diameter / 2,
            borderWidth: spinnerWidth,
            borderTopColor: backgroundColor,
            borderRightColor: backgroundColor,
            borderBottomColor: backgroundColor,
            borderLeftColor: spinnerColor,
        },
    });

    return (
        <View style={styles.container}>
            <Animated.View style={[styles.spinner, animatedStyles]} />
        </View>
    );
};

export default Spinner;
