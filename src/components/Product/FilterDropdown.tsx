import React, {useEffect, useRef, useState} from 'react';
import {
    Pressable,
    View,
    Text,
    StyleSheet,
    Modal,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {GENDER_OPTIONS, CATEGORY_OPTIONS, COLOUR_OPTIONS} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {
    TOGGLE_EXCLUDE,
    TOGGLE_FILTER,
    LOAD_UNSAVED_PRODUCTS,
} from '@/store/slices/product';
import AnimatedButton from '../Utility/AnimatedButton';

type FilterItemProps = {
    item: string;
    options: string[];
    type: 'gender' | 'category' | 'color';
};

const FilterItem: React.FC<FilterItemProps> = ({item, options, type}) => {
    const [selected, setSelected] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setSelected(options.includes(item));
    }, [item, options]);

    const toggleFilter = () => {
        dispatch(TOGGLE_FILTER({item, type}));
    };

    return (
        <View>
            <TouchableOpacity onPress={toggleFilter} style={styles.filterItem}>
                <Text style={styles.option}>{item}</Text>
                {selected ? (
                    <Ionicons name="checkmark" style={styles.filterItemCheck} />
                ) : undefined}
            </TouchableOpacity>
        </View>
    );
};

const FilterDropdown = () => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);

    const DropdownButton = useRef(null);

    const selectedGenders = useAppSelector(
        state => state.product.filters.gender,
    );
    const selectedColours = useAppSelector(
        state => state.product.filters.color,
    );
    const selectedCategories = useAppSelector(
        state => state.product.filters.category,
    );
    const excludeDeleted = useAppSelector(
        state => state.product.filters.excludeDeleted,
    );
    const excludeSaved = useAppSelector(
        state => state.product.filters.excludeSaved,
    );

    const dispatch = useAppDispatch();

    const toggleDropdown = () => {
        visible ? setVisible(false) : openDropdown();
    };

    const openDropdown = () => {
        if (measureDropdownTop()) {
            setVisible(true);
        }
    };

    const toggleExclude = (type: 'saved' | 'deleted') => {
        dispatch(TOGGLE_EXCLUDE(type));
    };

    const search = () => {
        dispatch(
            LOAD_UNSAVED_PRODUCTS({
                queryStringParameters: {
                    loadAmount: 10,
                    type: 'unsaved',
                },
                initialLoad: true,
            }),
        );
    };

    const measureDropdownTop = (): boolean => {
        if (DropdownButton && DropdownButton.current) {
            // @ts-ignore
            DropdownButton.current.measure((_fx, _fy, _w, h, _px, py) => {
                setDropdownTop(py + h);
            });

            return true;
        }

        return false;
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                ref={DropdownButton}
                onPress={toggleDropdown}
                activeOpacity={0.6}
                onLayout={measureDropdownTop}>
                <View style={styles.buttonsContainer}>
                    <Text style={styles.buttonText}>Filters</Text>
                    <Ionicons
                        name="options-outline"
                        style={styles.buttonIcon}
                    />
                </View>
            </TouchableOpacity>
            <Modal visible={visible} transparent={true}>
                <Pressable style={styles.flexOne} onPress={toggleDropdown}>
                    <View style={[styles.dropdown, {top: dropdownTop}]}>
                        <View style={styles.columnsContainer}>
                            <View style={styles.column}>
                                <Text style={styles.columnHeader}>Gender</Text>
                                {GENDER_OPTIONS.map(g => (
                                    <FilterItem
                                        item={g}
                                        type="gender"
                                        options={selectedGenders}
                                        key={g}
                                    />
                                ))}
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.columnHeader}>
                                    Category
                                </Text>
                                {CATEGORY_OPTIONS.map(c => (
                                    <FilterItem
                                        item={c}
                                        type="category"
                                        options={selectedCategories}
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
                                        key={c}
                                    />
                                ))}
                            </View>
                        </View>
                        <View>
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search..."
                            />
                        </View>
                        <View style={styles.columnsContainer}>
                            <View style={styles.column}>
                                <TouchableOpacity
                                    style={
                                        excludeDeleted
                                            ? styles.activeExclude
                                            : styles.inactiveExclude
                                    }
                                    onPress={() => {
                                        toggleExclude('deleted');
                                    }}>
                                    <View
                                        style={styles.excludeButtonEmptyCol}
                                    />
                                    <Text
                                        style={
                                            excludeDeleted
                                                ? styles.activeExcludeText
                                                : styles.inactiveExcludeText
                                        }>
                                        Exclude Deleted
                                    </Text>
                                    {excludeDeleted ? (
                                        <Ionicons
                                            name="checkmark"
                                            color="#f3fcfa"
                                            style={styles.excludeButtonEmptyCol}
                                        />
                                    ) : (
                                        <View
                                            style={styles.excludeButtonEmptyCol}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                            <View style={styles.column}>
                                <TouchableOpacity
                                    style={
                                        excludeSaved
                                            ? styles.activeExclude
                                            : styles.inactiveExclude
                                    }
                                    onPress={() => {
                                        toggleExclude('saved');
                                    }}>
                                    <View
                                        style={styles.excludeButtonEmptyCol}
                                    />
                                    <Text
                                        style={
                                            excludeSaved
                                                ? styles.activeExcludeText
                                                : styles.inactiveExcludeText
                                        }>
                                        Exclude Liked
                                    </Text>
                                    {excludeSaved ? (
                                        <Ionicons
                                            name="checkmark"
                                            color="#f3fcfa"
                                            style={styles.excludeButtonEmptyCol}
                                        />
                                    ) : (
                                        <View
                                            style={styles.excludeButtonEmptyCol}
                                        />
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                        <View style={styles.flexOne}>
                            <Pressable>
                                <AnimatedButton
                                    style={styles.searchButton}
                                    textStyle={styles.searchButtonText}
                                    onPress={search}>
                                    Search
                                </AnimatedButton>
                            </Pressable>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 999,
    },
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
        zIndex: 99,
        elevation: 99,
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
    },
    columnsContainer: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        marginBottom: 10,
        padding: 5,
    },
    columnHeader: {
        fontWeight: '500',
        fontSize: 16,
    },
    option: {
        color: 'grey',
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    filterItem: {
        flexDirection: 'row',
        paddingVertical: 1,
    },
    filterItemCheck: {
        alignSelf: 'flex-end',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
        flexBasis: 12,
        flexGrow: 0,
        flexShrink: 0,
        marginBottom: 3,
    },
    searchInput: {
        color: '#1a1f25',
        borderColor: '#1a1f25',
        backgroundColor: '#f3fcfa',
        borderRadius: 5,
        borderWidth: 2,
        fontSize: 14,
        flexShrink: 0,
        flexGrow: 0,
        padding: 10,
        marginBottom: 10,
    },
    activeExclude: {
        borderColor: '#1a1f25',
        backgroundColor: '#1a1f25',
        borderWidth: 2,
        paddingVertical: 4,
        paddingHorizontal: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactiveExclude: {
        borderColor: '#1a1f25',
        borderWidth: 2,
        paddingVertical: 4,
        paddingHorizontal: 6,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeExcludeText: {
        color: '#f3fcfa',
        textAlign: 'center',
        fontWeight: '500',
        flex: 1,
    },
    inactiveExcludeText: {
        color: '#1a1f25',
        textAlign: 'center',
        fontWeight: '500',
    },
    excludeButtonEmptyCol: {
        flex: 1,
        flexBasis: 12,
        flexGrow: 0,
        flexShrink: 0,
    },
    searchButton: {
        backgroundColor: '#1a1f25',
        flex: 1,
        borderRadius: 3,
        marginBottom: 10,
    },
    searchButtonText: {
        color: '#f3fcfa',
        textAlign: 'center',
        paddingVertical: 5,
        fontWeight: '500',
    },
});

export default FilterDropdown;
