import React from 'react';
import {StyleSheet, View, Text} from 'react-native';

import {PALETTE} from '@/constants';

type SectionHeaderProps = {
    children: string;
};

const SectionHeader: React.FC<SectionHeaderProps> = ({children}) => {
    return (
        <View style={styles.container}>
            <View style={styles.line} />
            <Text style={styles.header}>{children}</Text>
            <View style={styles.line} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
    },
    line: {
        height: 1,
        flex: 1,
        backgroundColor: PALETTE.neutral[4],
    },
    header: {
        fontSize: 13,
        marginVertical: 5,
        paddingHorizontal: 15,
        fontWeight: '300',
        color: PALETTE.neutral[4],
    },
});

export default SectionHeader;
