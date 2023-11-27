import React, {useEffect, useMemo} from 'react';
import {View, Text, TouchableOpacity} from 'react-native';

import BottomSheet from '@/components/BottomSheet/BottomSheet';
import {useBottomSheetContext} from '@/context/BottomSheet';

const AddToCollectionBottomSheet = () => {
    const {closeBottomSheet} = useBottomSheetContext();

    const snapPoints = useMemo(() => [0.4], []);

    useEffect(() => {
        console.log('ADD TO COLL');
    }, []);

    return (
        <BottomSheet snapPoints={snapPoints}>
            <View>
                <TouchableOpacity onPress={closeBottomSheet}>
                    <Text>Close</Text>
                </TouchableOpacity>
            </View>
        </BottomSheet>
    );
};

export default AddToCollectionBottomSheet;
