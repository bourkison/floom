import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Collapsible from 'react-native-collapsible';

import {PALETTE} from '@/constants';

type CollapsibleSectionProps = {
    children: React.JSX.Element[];
    expanded: boolean;
    onHeaderPress: () => void;
    headerText: string;
};

const CollapsibleSection = ({
    children,
    onHeaderPress,
    headerText,
    expanded,
}: CollapsibleSectionProps) => {
    return (
        <View>
            <TouchableOpacity
                style={styles.headerContainer}
                onPress={onHeaderPress}>
                <Text style={styles.headerText}>{headerText}</Text>
            </TouchableOpacity>

            <Collapsible collapsed={!expanded}>{children}</Collapsible>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: PALETTE.neutral[1],
        paddingVertical: 10,
        paddingHorizontal: 20,
    },
    headerText: {
        fontWeight: '400',
        fontSize: 14,
    },
});

export default CollapsibleSection;
