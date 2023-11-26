import {AntDesign} from '@expo/vector-icons';
import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import Collapsible from 'react-native-collapsible';

import {PALETTE} from '@/constants';

type CollapsibleSectionProps = {
    children: React.JSX.Element[];
    expanded: boolean;
    onHeaderPress: () => void;
    headerText: string;
    showIcon?: boolean;
    disabled?: boolean;
};

const CollapsibleSection = ({
    children,
    onHeaderPress,
    headerText,
    expanded,
    showIcon = true,
    disabled = false,
}: CollapsibleSectionProps) => {
    return (
        <View>
            <TouchableOpacity
                disabled={disabled}
                style={styles.headerContainer}
                onPress={onHeaderPress}>
                <View>
                    <Text style={styles.headerText}>{headerText}</Text>
                </View>
                <View>
                    {showIcon &&
                        (expanded ? (
                            <AntDesign name="minus" size={14} />
                        ) : (
                            <AntDesign name="plus" size={14} />
                        ))}
                </View>
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerText: {
        fontWeight: '400',
        fontSize: 14,
    },
});

export default CollapsibleSection;
