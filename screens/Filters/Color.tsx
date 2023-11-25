import {Ionicons} from '@expo/vector-icons';
import React, {useMemo} from 'react';
import {View, Text, StyleSheet, ScrollView} from 'react-native';
import {TouchableHighlight} from 'react-native-gesture-handler';

import {COLOR_OPTIONS, PALETTE} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {toggleColor} from '@/store/slices/product';

type ColorListItemProps = {
    color: (typeof COLOR_OPTIONS)[number];
};

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const COLOR_PREVIEW_DIAMETER = 24;

const ColorListItem = ({color}: ColorListItemProps) => {
    const dispatch = useAppDispatch();

    const selectedColors = useAppSelector(
        state => state.product.unsaved.filters.color,
    );

    const isSelected = useMemo(() => {
        const index = selectedColors.findIndex(
            selected => selected.value === color.value,
        );

        return !(index < 0);
    }, [selectedColors, color]);

    const toggle = () => {
        dispatch(toggleColor({obj: 'unsaved', color}));
    };

    return (
        <TouchableHighlight
            onPress={toggle}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.listItemContainer}>
                <View style={styles.leftColumnContainer}>
                    <View
                        style={[
                            styles.colorPreview,
                            {backgroundColor: color.color},
                        ]}
                    />
                    <Text style={styles.colorText}>{color.label}</Text>
                </View>
                {isSelected && (
                    <View>
                        <Ionicons
                            name="checkmark"
                            color={PALETTE.neutral[8]}
                            size={18}
                        />
                    </View>
                )}
            </View>
        </TouchableHighlight>
    );
};

const Color = () => {
    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollContainer}>
                <View style={styles.listContainer}>
                    {COLOR_OPTIONS.map(color => (
                        <ColorListItem color={color} key={color.value} />
                    ))}
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContainer: {
        paddingVertical: 20,
    },
    listContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    listItemContainer: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    leftColumnContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    colorPreview: {
        height: COLOR_PREVIEW_DIAMETER,
        width: COLOR_PREVIEW_DIAMETER,
        borderRadius: COLOR_PREVIEW_DIAMETER / 2,
        marginRight: 15,
    },
    colorText: {
        fontSize: 16,
        paddingVertical: 14,
        fontWeight: '500',
    },
});

export default Color;
