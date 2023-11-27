import React, {useCallback, useMemo, useState} from 'react';
import {useWindowDimensions} from 'react-native';
import {useSharedValue, withTiming} from 'react-native-reanimated';

import {BottomSheetContext} from '@/context/BottomSheet';
import {HEADER_HEIGHT} from '@/nav/Headers';

type BottomSheetProviderProps = {
    children: React.JSX.Element;
};

const BottomSheetProvider = ({children}: BottomSheetProviderProps) => {
    const [snapPoints, setSnapPoints] = useState<number[]>([]);
    const translateY = useSharedValue(0);
    const {height} = useWindowDimensions();

    const availableHeight = useMemo(() => height - HEADER_HEIGHT, [height]);

    const openBottomSheet = useCallback(() => {
        if (!snapPoints.length) {
            throw new Error('No snap points set');
        }

        translateY.value = withTiming(
            snapPoints[snapPoints.length - 1] * availableHeight,
        );
        console.log('OPEN BOTTOM SHEET');
    }, [snapPoints, translateY, availableHeight]);

    const closeBottomSheet = useCallback(() => {
        translateY.value = withTiming(0);
    }, [translateY]);

    return (
        <BottomSheetContext.Provider
            value={{
                setSnapPoints,
                translateY,
                saves: [],
                openBottomSheet,
                closeBottomSheet,
            }}>
            {children}
        </BottomSheetContext.Provider>
    );
};

export default BottomSheetProvider;
