import React from 'react';
import {StyleSheet, View} from 'react-native';

import SetGender from '@/components/User/SetGender';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {setGender} from '@/store/slices/product';

const Gender = () => {
    const gender = useAppSelector(
        state => state.product.unsaved.filters.gender,
    );
    const dispatch = useAppDispatch();

    return (
        <View style={styles.container}>
            <SetGender value={gender} onChange={g => dispatch(setGender(g))} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: 10,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: '#FFF',
        paddingHorizontal: 25,
        paddingVertical: 25,
        marginBottom: 25,
    },
});

export default Gender;
