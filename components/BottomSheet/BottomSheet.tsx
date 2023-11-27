import React, {useEffect, useMemo} from 'react';
import {Modal, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {useAnimatedStyle} from 'react-native-reanimated';

import {useBottomSheetContext} from '@/context/BottomSheet';

type BottomSheetContainerProps = {
    children: React.JSX.Element;
    snapPoints: number[];
};

const BottomSheet = ({children, snapPoints}: BottomSheetContainerProps) => {
    const {height} = useWindowDimensions();
    const {
        setSnapPoints,
        translateY,
        modalExpanded,
        closeBottomSheet,
        overlayColor,
    } = useBottomSheetContext();

    const rOverlayStyle = useAnimatedStyle(() => ({
        backgroundColor: overlayColor.value,
    }));

    const availableHeight = useMemo(() => height, [height]);

    useEffect(() => {
        setSnapPoints(snapPoints);
    }, [snapPoints, setSnapPoints]);

    const rStyle = useAnimatedStyle(() => ({
        transform: [{translateY: -translateY.value}],
    }));

    return (
        <Modal visible={modalExpanded} transparent>
            <Animated.View style={[StyleSheet.absoluteFill, rOverlayStyle]}>
                <Pressable
                    onPress={closeBottomSheet}
                    style={StyleSheet.absoluteFill}
                />
            </Animated.View>
            <Animated.View
                style={[
                    styles.container,
                    {height: availableHeight, top: availableHeight},
                    rStyle,
                ]}>
                {children}
            </Animated.View>
        </Modal>
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
