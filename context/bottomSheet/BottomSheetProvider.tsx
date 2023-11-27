import React, {useCallback, useState} from 'react';
import {Modal, Pressable, StyleSheet, useWindowDimensions} from 'react-native';
import Animated, {
    interpolateColor,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {BottomSheetContext} from '@/context/BottomSheet';

type BottomSheetProviderProps = {
    children: React.JSX.Element;
};

const BottomSheetProvider = ({children}: BottomSheetProviderProps) => {
    const [snapPoint, setSnapPoint] = useState<number>(0);
    const translateY = useSharedValue(0);
    const [renderedContent, setRenderedContent] = useState<React.JSX.Element>();

    const {height} = useWindowDimensions();

    const overlayColor = useDerivedValue(() =>
        interpolateColor(
            translateY.value,
            [0, snapPoint * height],
            ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)'],
        ),
    );

    const openBottomSheet = useCallback(
        (element: React.JSX.Element, sp: number) => {
            if (renderedContent !== undefined) {
                throw new Error('Bottom sheet already expanded');
            }

            setSnapPoint(sp);
            setRenderedContent(element);

            translateY.value = withTiming(sp * height);
            console.log('OPEN BOTTOM SHEET');
        },
        [translateY, height, renderedContent],
    );

    const closeBottomSheet = useCallback(() => {
        translateY.value = withTiming(0, {}, () =>
            runOnJS(setRenderedContent)(undefined),
        );
    }, [translateY]);

    const rOverlayStyle = useAnimatedStyle(() => ({
        backgroundColor: overlayColor.value,
    }));

    const rStyle = useAnimatedStyle(() => ({
        transform: [{translateY: -translateY.value}],
    }));

    return (
        <BottomSheetContext.Provider
            value={{
                openBottomSheet,
                closeBottomSheet,
            }}>
            <>
                {children}
                {renderedContent && (
                    <Modal visible={renderedContent !== undefined} transparent>
                        <Animated.View
                            style={[StyleSheet.absoluteFill, rOverlayStyle]}>
                            <Pressable
                                onPress={closeBottomSheet}
                                style={StyleSheet.absoluteFill}
                            />
                        </Animated.View>
                        <Animated.View
                            style={[
                                styles.container,
                                {height, top: height},
                                rStyle,
                            ]}>
                            {renderedContent}
                        </Animated.View>
                    </Modal>
                )}
            </>
        </BottomSheetContext.Provider>
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

export default BottomSheetProvider;
