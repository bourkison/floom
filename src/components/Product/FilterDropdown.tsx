import React, {useRef, useState} from 'react';
import {Pressable, View, Text, StyleSheet, Modal} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {GENDER_OPTIONS, CATEGORY_OPTIONS, COLOUR_OPTIONS} from '@/constants';

const FilterDropdown = () => {
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
                                <View>
                                    <Text style={styles.option}>{g}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Category</Text>
                            {CATEGORY_OPTIONS.map(c => (
                                <View>
                                    <Text style={styles.option}>{c}</Text>
                                </View>
                            ))}
                        </View>
                        <View style={styles.column}>
                            <Text style={styles.columnHeader}>Colour</Text>
                            {COLOUR_OPTIONS.map(c => (
                                <View>
                                    <Text style={styles.option}>{c}</Text>
                                </View>
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
