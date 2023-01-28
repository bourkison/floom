import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {PALETTE} from '@/constants';

const AppInfoWidget = () => {
    return (
        <View>
            <Text style={styles.hintText}>© Harrison Bourke, 2023</Text>
            <Text style={styles.hintText}>
                If you have any questions or suggestions, please feel reach out
                on harrison@floomapp.com and I'll endeavour to respond.
            </Text>
        </View>
    );
};

const styles = StyleSheet.create({
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
});

export default AppInfoWidget;
