import React, {useCallback, useMemo, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {
    interpolateColor,
    runOnJS,
    useDerivedValue,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {BottomSheetContext} from '@/context/BottomSheet';

type BottomSheetProviderProps = {
    children: React.JSX.Element;
};

const BottomSheetProvider = ({children}: BottomSheetProviderProps) => {
    const [snapPoints, setSnapPoints] = useState<number[]>([]);
    const [modalExpanded, setModalExpanded] = useState(false);
    const translateY = useSharedValue(0);
    const {height} = useWindowDimensions();

    const availableHeight = useMemo(() => height, [height]);

    const overlayColor = useDerivedValue(() =>
        interpolateColor(
            translateY.value,
            [0, snapPoints[0] * availableHeight],
            ['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.3)'],
        ),
    );

    const openBottomSheet = useCallback(() => {
        if (!snapPoints.length) {
            throw new Error('No snap points set');
        }

        setModalExpanded(true);
        translateY.value = withTiming(
            snapPoints[snapPoints.length - 1] * availableHeight,
        );
        console.log('OPEN BOTTOM SHEET');
    }, [snapPoints, translateY, availableHeight]);

    const closeBottomSheet = useCallback(() => {
        translateY.value = withTiming(0, {}, () =>
            runOnJS(setModalExpanded)(false),
        );
    }, [translateY]);

    return (
        <BottomSheetContext.Provider
            value={{
                setSnapPoints,
                translateY,
                saves: [],
                modalExpanded,
                openBottomSheet,
                overlayColor,
                closeBottomSheet,
            }}>
            {children}
        </BottomSheetContext.Provider>
    );
};

export default BottomSheetProvider;
