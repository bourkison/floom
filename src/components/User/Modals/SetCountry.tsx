import React, {useState} from 'react';
import {PALETTE} from '@/constants';
import {
    Modal,
    View,
    Text,
    TextInput,
    StyleSheet,
    ScrollView,
    SafeAreaView,
    TouchableOpacity,
} from 'react-native';
import {COUNTRIES} from '@/constants/countries';
import {Ionicons} from '@expo/vector-icons';

type SetCountryProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: typeof COUNTRIES[keyof typeof COUNTRIES];
    setSelectedValue: (
        gender: typeof COUNTRIES[keyof typeof COUNTRIES],
    ) => void;
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
            <SafeAreaView
                style={{backgroundColor: PALETTE.neutral[0], flex: 1}}>
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
                        </View>
                    </View>
                </View>
                <ScrollView>
                    {Object.values(COUNTRIES)
                        .filter(country =>
                            searchText ? country.includes(searchText) : true,
                        )
                        .map(country => (
                            <View key={country}>
                                <TouchableOpacity
                                    onPress={() => {
                                        setSelectedValue(country);
                                        setVisible(false);
                                    }}>
                                    <Text>{country}</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                </ScrollView>
            </SafeAreaView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    pressableContainer: {
        flex: 1,
    },
    modalContainer: {
        backgroundColor: PALETTE.neutral[0],
        position: 'absolute',
        bottom: 0,
        height: 500,
        width: '100%',
    },
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
});

export default SetCountry;
