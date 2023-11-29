import React, {useEffect} from 'react';
import {StyleSheet, View} from 'react-native';
import Animated, {
    interpolate,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {PALETTE} from '@/constants';

type ImageIndicatorIconProps = {
    selected: boolean;
};

type ImageIndicatorProps = {
    amount: number;
    selectedIndex: number;
};

const MIN_OPACITY = 0.5;
const MAX_OPACITY = 1;

const MIN_SCALE = 1;
const MAX__SCALE = 1.2;

const ImageIndicatorIcon = ({selected}: ImageIndicatorIconProps) => {
    const sVal = useSharedValue(0);

    useEffect(() => {
        if (selected) {
            sVal.value = withTiming(1);

            return;
        }

        sVal.value = withTiming(0);
    }, [selected, sVal]);

    const sOpacity = useDerivedValue(() =>
        interpolate(sVal.value, [0, 1], [MIN_OPACITY, MAX_OPACITY]),
    );
    const sScale = useDerivedValue(() =>
        interpolate(sVal.value, [0, 1], [MIN_SCALE, MAX__SCALE]),
    );

    const rStyle = useAnimatedStyle(() => ({
        opacity: sOpacity.value,
        transform: [{scale: sScale.value}],
    }));

    return <Animated.View style={[styles.icon, rStyle]} />;
};

const ImageIndicator = ({amount, selectedIndex}: ImageIndicatorProps) => {
    return (
        <View style={styles.container}>
            {Array.from(new Array(amount)).map((_, index) => (
                <ImageIndicatorIcon
                    key={index}
                    selected={index === selectedIndex}
                />
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
    },
    icon: {
        backgroundColor: PALETTE.neutral[9],
        borderColor: PALETTE.neutral[0],
        borderWidth: 1,
        width: 10,
        height: 10,
        borderRadius: 5,
        marginHorizontal: 3,
    },
});

export default ImageIndicator;
