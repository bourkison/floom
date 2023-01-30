import {PALETTE} from '@/constants';
import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const FloomLogo = () => {
    return (
        <View>
            <Text style={styles.logoText}>floom</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    logoText: {
        fontFamily: 'Gilroy',
        fontSize: 72,
        letterSpacing: -4,
        color: PALETTE.neutral[9],
    },
});
export default FloomLogo;
