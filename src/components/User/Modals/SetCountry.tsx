import React, {useState} from 'react';
import {PALETTE} from '@/constants';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Pressable,
} from 'react-native';
import {COUNTRIES} from '@/constants/countries';
import {Ionicons, Feather} from '@expo/vector-icons';
import {FlashList} from '@shopify/flash-list';

type SetCountryProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: keyof typeof COUNTRIES;
    setSelectedValue: (country: keyof typeof COUNTRIES) => void;
};

const SetCountry: React.FC<SetCountryProps> = ({
    visible,
    setVisible,
    selectedValue,
    setSelectedValue,
}) => {
    const [searchText, setSearchText] = useState('');

    return (
        <Modal visible={visible} animationType="slide" transparent={true}>
            <SafeAreaView style={styles.safeContainer}>
                <View style={styles.buttonsContainer}>
                    <View style={styles.textInputContainer}>
                        <View style={styles.searchSection}>
                            <Ionicons
                                name="search"
                                style={styles.searchIcon}
                                color={PALETTE.neutral[0]}
                            />
                            <TextInput
                                style={styles.searchInput}
                                placeholder="Search"
                                placeholderTextColor={PALETTE.neutral[3]}
                                onChangeText={setSearchText}
                                value={searchText}
                                returnKeyType="search"
                                selectTextOnFocus={true}
                            />
                            {searchText.length > 0 ? (
                                <Pressable onPress={() => setSearchText('')}>
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
                    <View style={styles.cancelButton}>
                        <TouchableOpacity onPress={() => setVisible(false)}>
                            <Text>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <FlashList
                    data={Object.values(COUNTRIES)
                        .filter(c => c.name.includes(searchText))
                        .sort((a, b) => a.name.localeCompare(b.name))}
                    estimatedItemSize={
                        styles.countryText.fontSize +
                        2 * styles.countryText.paddingVertical
                    }
                    keyExtractor={country => country.code}
                    ItemSeparatorComponent={() => (
                        <View style={styles.seperator} />
                    )}
                    renderItem={({item}) => (
                        <View style={styles.countryOption}>
                            <TouchableOpacity
                                style={styles.touchableContainer}
                                onPress={() => {
                                    setSelectedValue(item.code);
                                    setVisible(false);
                                    setSearchText('');
                                }}>
                                <Text style={styles.countryText}>
                                    {item.emoji + ' ' + item.name}
                                </Text>
                                {item.code === selectedValue ? (
                                    <Ionicons
                                        name="checkmark"
                                        size={14}
                                        style={styles.check}
                                    />
                                ) : undefined}
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    safeContainer: {backgroundColor: PALETTE.neutral[0], flex: 1},
    buttonsContainer: {
        backgroundColor: '#FFF',
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
    },
    textInputContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
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
    countryOption: {},
    cancelButton: {marginRight: 10},
    countryText: {
        fontSize: 16,
        paddingVertical: 14,
        paddingLeft: 8,
    },
    seperator: {
        borderColor: PALETTE.gray[2],
        borderTopWidth: 1,
    },
    touchableContainer: {
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
    },
    check: {
        flex: 1,
        textAlign: 'right',
        paddingRight: 8,
    },
});

export default SetCountry;
