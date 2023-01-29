import React, {useCallback, useEffect, useRef, useState} from 'react';
import {
    Pressable,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    useWindowDimensions,
} from 'react-native';

import {Ionicons, Feather} from '@expo/vector-icons';
import {
    GENDER_OPTIONS,
    CATEGORY_OPTIONS,
    COLOUR_OPTIONS,
    PALETTE,
} from '@/constants';

import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {
    TOGGLE_EXCLUDE,
    TOGGLE_FILTER,
    LOAD_UNSAVED_PRODUCTS,
    UPDATE_SEARCH_FILTER,
    LOAD_SAVED_PRODUCTS,
    LOAD_DELETED_PRODUCTS,
    CLEAR_FILTERS,
} from '@/store/slices/product';
import AnimatedButton from '../Utility/AnimatedButton';

type FilterItemProps = {
    item: string;
    options: string[];
    type: 'gender' | 'category' | 'color';
    obj: 'saved' | 'unsaved' | 'deleted';
};

export const FILTER_DROPDOWN_CLOSED_HEIGHT = 40;

const FilterItem: React.FC<FilterItemProps> = ({item, options, type, obj}) => {
    const [selected, setSelected] = useState(false);
    const dispatch = useAppDispatch();

    useEffect(() => {
        setSelected(options.includes(item));
    }, [item, options]);

    const toggleFilter = () => {
        dispatch(TOGGLE_FILTER({item, type, obj}));
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

type FilterDropdownProps = {
    obj: 'saved' | 'unsaved' | 'deleted';
};

const FilterDropdown: React.FC<FilterDropdownProps> = ({obj}) => {
    const [visible, setVisible] = useState(false);
    const [dropdownTop, setDropdownTop] = useState(0);

    const [hiddenPressableTop, setHiddenPressableTop] = useState(0);
    const [hiddenPressableHeight, setHiddenPressableHeight] = useState(0);

    const {height: windowHeight} = useWindowDimensions();

    const DropdownButton = useRef<TouchableOpacity>(null);
    const SearchInput = useRef<TextInput>(null);

    // TODO: Currently just getting state from store. Should potentially
    // keep a local reference within this component then only dispatch to store
    // on search button?
    const selectedGenders = useAppSelector(
        state => state.product[obj].filters.gender,
    );
    const selectedColours = useAppSelector(
        state => state.product[obj].filters.color,
    );
    const selectedCategories = useAppSelector(
        state => state.product[obj].filters.category,
    );
    const excludeDeleted = useAppSelector(
        state => state.product.unsaved.filters.excludeDeleted,
    );
    const excludeSaved = useAppSelector(
        state => state.product.unsaved.filters.excludeSaved,
    );
    const searchText = useAppSelector(
        state => state.product[obj].filters.searchText,
    );

    const dispatch = useAppDispatch();

    const toggleDropdown = () => {
        visible ? closeDropdown() : openDropdown();
    };

    const openDropdown = () => {
        if (dropdownTop || measureDropdownTop()) {
            setVisible(true);
        }
    };

    const closeDropdown = () => {
        SearchInput.current?.blur();
        setVisible(false);
    };

    const toggleExclude = (t: 'saved' | 'deleted') => {
        dispatch(TOGGLE_EXCLUDE(t));
    };

    const updateSearchText = (pl: string) => {
        dispatch(UPDATE_SEARCH_FILTER({obj, pl}));
    };

    const search = () => {
        if (obj === 'unsaved') {
            dispatch(
                LOAD_UNSAVED_PRODUCTS({
                    queryStringParameters: {
                        loadAmount: 10,
                        type: 'unsaved',
                    },
                    loadType: 'initial',
                    filtered: true,
                }),
            );
        } else if (obj === 'saved') {
            dispatch(
                LOAD_SAVED_PRODUCTS({
                    queryStringParameters: {
                        loadAmount: 10,
                        type: 'saved',
                        reversed: true,
                    },
                    loadType: 'initial',
                    filtered: true,
                }),
            );
        } else if (obj === 'deleted') {
            dispatch(
                LOAD_DELETED_PRODUCTS({
                    queryStringParameters: {
                        loadAmount: 10,
                        type: 'deleted',
                        reversed: true,
                    },
                    loadType: 'initial',
                    filtered: true,
                }),
            );
        }

        closeDropdown();
    };

    const measureDropdownTop = (): boolean => {
        console.log(dropdownTop);
        if (DropdownButton && DropdownButton.current) {
            DropdownButton.current.measure((_fx, _fy, _w, h) => {
                setDropdownTop(h);
            });

            return true;
        }

        return false;
    };

    const clearIconNumber = useCallback(() => {
        if (obj === 'unsaved') {
            return selectedCategories.length + selectedColours.length;
        }

        return (
            selectedCategories.length +
            selectedGenders.length +
            selectedColours.length
        );
    }, [selectedCategories, selectedColours, obj, selectedGenders]);

    const ClearIcon = () => {
        const clearFilters = () => {
            dispatch(CLEAR_FILTERS({obj}));
        };

        if (visible) {
            return (
                <View style={[styles.iconContainer, styles.noLeftMargin]}>
                    <Pressable
                        style={styles.clearIconContainer}
                        onPress={clearFilters}>
                        <Text style={styles.clearIconText}>
                            {clearIconNumber()}
                        </Text>
                    </Pressable>
                </View>
            );
        } else {
            return (
                <View style={[styles.iconContainer, styles.noLeftMargin]}>
                    <View style={styles.clearIconContainer}>
                        <Text style={styles.clearIconText}>
                            {clearIconNumber()}
                        </Text>
                    </View>
                </View>
            );
        }
    };

    return (
        <View style={styles.container}>
            <TouchableOpacity
                ref={DropdownButton}
                onPress={toggleDropdown}
                activeOpacity={0.6}
                onLayout={measureDropdownTop}>
                <View style={styles.buttonsContainer}>
                    <View style={styles.textInputContainer}>
                        <View style={styles.searchSection}>
                            <Ionicons
                                name="search"
                                style={styles.searchIcon}
                                color={PALETTE.neutral[0]}
                            />

                            <TextInput
                                ref={SearchInput}
                                style={styles.searchInput}
                                placeholder="Search"
                                placeholderTextColor={PALETTE.neutral[3]}
                                onChangeText={updateSearchText}
                                onFocus={openDropdown}
                                onSubmitEditing={search}
                                value={searchText}
                                returnKeyType="search"
                                selectTextOnFocus={true}
                            />

                            {searchText.length > 0 ? (
                                <Pressable
                                    onPress={() => {
                                        updateSearchText('');

                                        if (!visible) {
                                            search();
                                        }
                                    }}>
                                    <Feather
                                        name="x-circle"
                                        style={styles.searchIcon}
                                        color={PALETTE.neutral[0]}
                                        size={14}
                                    />
                                </Pressable>
                            ) : undefined}
                        </View>
                    </View>
                    <View style={styles.iconContainer}>
                        <Ionicons
                            name="options-outline"
                            style={styles.buttonIcon}
                            size={16}
                        />
                    </View>
                    {clearIconNumber() > 0 ? <ClearIcon /> : undefined}
                </View>
            </TouchableOpacity>
            {visible ? (
                <View
                    style={[
                        styles.pressable,
                        {
                            top: dropdownTop,
                        },
                    ]}>
                    <ScrollView
                        style={styles.dropdown}
                        keyboardShouldPersistTaps={'never'}
                        onLayout={({
                            nativeEvent: {
                                layout: {height},
                            },
                        }) => {
                            const topVal = height;
                            setHiddenPressableTop(topVal);
                            setHiddenPressableHeight(windowHeight - height);
                        }}>
                        <View style={styles.columnsContainer}>
                            <View style={styles.column}>
                                <Text style={styles.columnHeader}>Gender</Text>
                                {GENDER_OPTIONS.map(g => (
                                    <FilterItem
                                        obj={obj}
                                        item={g.label}
                                        type="gender"
                                        options={selectedGenders}
                                        key={g.value}
                                    />
                                ))}
                            </View>
                            <View style={styles.column}>
                                <Text style={styles.columnHeader}>
                                    Category
                                </Text>
                                {CATEGORY_OPTIONS.map(c => (
                                    <FilterItem
                                        obj={obj}
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
                                        obj={obj}
                                        item={c}
                                        type="color"
                                        options={selectedColours}
                                        key={c}
                                    />
                                ))}
                            </View>
                        </View>
                        {obj === 'unsaved' ? (
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
                                                style={
                                                    styles.excludeButtonEmptyCol
                                                }
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.excludeButtonEmptyCol
                                                }
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
                                                style={
                                                    styles.excludeButtonEmptyCol
                                                }
                                            />
                                        ) : (
                                            <View
                                                style={
                                                    styles.excludeButtonEmptyCol
                                                }
                                            />
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </View>
                        ) : undefined}

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
                    </ScrollView>
                    <Pressable
                        style={{
                            height: hiddenPressableHeight,
                            top: hiddenPressableTop + 10,
                        }}
                        onPress={closeDropdown}
                    />
                </View>
            ) : undefined}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        zIndex: 999,
    },
    flexOne: {flex: 1},
    pressable: {
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        position: 'absolute',
        flex: 1,
        flexDirection: 'column',
        shadowColor: PALETTE.neutral[9],
        shadowOpacity: 0.2,
        shadowOffset: {height: 5, width: 0},
    },
    buttonsContainer: {
        backgroundColor: '#FFF',
        height: FILTER_DROPDOWN_CLOSED_HEIGHT,
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
    iconContainer: {
        flexBasis: 24,
        marginHorizontal: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonIcon: {},
    dropdown: {
        position: 'absolute',
        width: '100%',
        backgroundColor: '#fff',
        borderBottomLeftRadius: 5,
        borderBottomRightRadius: 5,
        paddingTop: 10,
        paddingBottom: 0,
        paddingHorizontal: 15,
        elevation: 5,
    },
    columnsContainer: {
        flexDirection: 'row',
    },
    column: {
        flex: 1,
        marginBottom: 10,
        padding: 5,
    },
    noLeftMargin: {
        marginLeft: 0,
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
    textInputContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingLeft: 10,
    },
    searchSection: {
        backgroundColor: PALETTE.neutral[5],
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        color: PALETTE.neutral[0],
        fontSize: 14,
        alignSelf: 'center',
        paddingVertical: 5,
        flex: 1,
    },
    searchIcon: {
        paddingHorizontal: 5,
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
    clearIconContainer: {
        width: 24,
        height: 24,
        borderRadius: 24,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearIconText: {
        color: '#FFF',
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default FilterDropdown;
