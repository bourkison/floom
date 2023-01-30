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
        fontFamily: 'Gilroy-ExtraBold',
        fontSize: 72,
        letterSpacing: -4,
        color: PALETTE.neutral[9],
        textShadowColor: PALETTE.neutral[0],
        shadowOpacity: 0.6,
        shadowColor: PALETTE.neutral[6],
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
});
export default FloomLogo;
