import React, {useEffect, useMemo} from 'react';
import {StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import {useBottomSheetContext} from '@/context/BottomSheet';
import {HEADER_HEIGHT} from '@/nav/Headers';

type BottomSheetContainerProps = {
    children: React.JSX.Element;
    snapPoints: number[];
};

const BottomSheet = ({children, snapPoints}: BottomSheetContainerProps) => {
    const {height} = useWindowDimensions();
    const {setSnapPoints, translateY} = useBottomSheetContext();

    const availableHeight = useMemo(() => height - HEADER_HEIGHT, [height]);

    useEffect(() => {
        setSnapPoints(snapPoints);
    }, [snapPoints, setSnapPoints]);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{translateY: -translateY.value}],
    }));

    return (
        <Animated.View
            style={[
                styles.container,
                {height: availableHeight, top: availableHeight},
                rStyle,
            ]}>
            {children}
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        backgroundColor: 'white',
        position: 'absolute',
        borderRadius: 25,
    },
});

export default BottomSheet;
