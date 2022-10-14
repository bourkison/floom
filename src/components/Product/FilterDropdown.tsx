import React, {useEffect, useRef, useState} from 'react';
import {Pressable, View, Text, StyleSheet, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {GENDER_OPTIONS, CATEGORY_OPTIONS, COLOUR_OPTIONS} from '@/constants';

type FilterItemProps = {
    item: string;
    options: string[];
    type: 'gender' | 'category' | 'color';
    toggleItem: (item: string, type: 'gender' | 'category' | 'color') => void;
};

type FilterDropdownProps = {
    selectedGenders: string[];
    selectedCategories: string[];
    selectedColours: string[];
    toggleItem: (item: string, type: 'gender' | 'category' | 'color') => void;
};

const FilterItem: React.FC<FilterItemProps> = ({
    item,
    options,
    toggleItem,
    type,
}) => {
    const [selected, setSelected] = useState(false);

    useEffect(() => {
        setSelected(options.includes(item));
    }, [item, options]);

    return (
        <View>
            <Pressable
                onPress={() => {
                    toggleItem(item, type);
                }}>
                <Text style={styles.option}>
                    {item} {selected ? 'true' : 'false'}
                </Text>
            </Pressable>
        </View>
    );
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({
    toggleItem,
    selectedCategories,
    selectedColours,
    selectedGenders,
}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);
    const DropdownButton = useRef(null);

    const toggleDropdown = () => {
        visible ? setVisible(false) : openDropdown();
    };

    const openDropdown = () => {
        if (DropdownButton && DropdownButton.current) {
            // @ts-ignore
            DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
                setDropdownTop(py + h);
            });

            setVisible(true);
        }
    };

    return (
        <View>
            <Pressable ref={DropdownButton} onPress={toggleDropdown}>
                <View style={styles.buttonsContainer}>
                    <Text style={styles.buttonText}>Filters</Text>
                    <Ionicons
                        name="options-outline"
                        style={styles.buttonIcon}
                    />
                </View>
            </Pressable>
            <Modal visible={visible} transparent={true}>
                <Pressable style={styles.flexOne} onPress={toggleDropdown}>
                    <View style={[styles.dropdown, {top: dropdownTop}]}>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Gender</Text>
                            {GENDER_OPTIONS.map(g => (
                                <FilterItem
                                    item={g}
                                    type="gender"
                                    options={selectedGenders}
                                    toggleItem={toggleItem}
                                    key={g}
                                />
                            ))}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Category</Text>
                            {CATEGORY_OPTIONS.map(c => (
                                <FilterItem
                                    item={c}
                                    type="category"
                                    options={selectedCategories}
                                    toggleItem={toggleItem}
                                    key={c}
                                />
                            ))}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Colour</Text>
                            {COLOUR_OPTIONS.map(c => (
                                <FilterItem
                                    item={c}
                                    type="color"
                                    options={selectedColours}
                                    toggleItem={toggleItem}
                                    key={c}
                                />
                            ))}
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    flexOne: {flex: 1},
    buttonsContainer: {
        backgroundColor: '#fff',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -1,
            width: -1,
        },
        shadowOpacity: 0.3,
        flexDirection: 'row',
    },
    buttonText: {
        fontWeight: '500',
    },
    buttonIcon: {
        marginLeft: 3,
    },
    dropdown: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#fff',
        shadowColor: '#000000',
        shadowRadius: 4,
        shadowOffset: {height: 4, width: 0},
        shadowOpacity: 0.5,
        borderRadius: 5,
        paddingTop: 10,
        paddingBottom: 0,
        paddingHorizontal: 15,
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        maxHeight: 256,
        marginBottom: 10,
        padding: 5,
    },
    columnHeader: {
        fontWeight: '500',
        fontSize: 16,
    },
    option: {
        color: 'grey',
    },
});

export default FilterDropdown;
