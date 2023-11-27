import {BottomSheetView} from '@gorhom/bottom-sheet';
import React, {useEffect} from 'react';
import {View, Text} from 'react-native';

import {useAddToCollectionContext} from '@/context/bottomSheet';

const AddToCollectionBottomSheet = () => {
    const {saves, bottomSheetRef, snapPoints} = useAddToCollectionContext();

    useEffect(() => {
        console.log('ADD TO COLL');
    }, []);

    return (
        <BottomSheetView
            ref={bottomSheetRef}
            snapPoints={snapPoints}
            index={-1}>
            <View>
                {saves.map(save => (
                    <View key={save.id}>
                        <Text>{save.name}</Text>
                    </View>
                ))}
            </View>
        </BottomSheetView>
    );
};

export default AddToCollectionBottomSheet;
