import React from 'react';
import {View, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppDispatch} from '@/store/hooks';
import {LOGOUT} from '@/store/slices/user';
import {Feather} from '@expo/vector-icons';
import {Color} from '@/types';

type OptionItemProps = {
    children: string;
    onPress?: () => void;
    color?: Color;
};

const OptionItem: React.FC<OptionItemProps> = ({children, onPress, color}) => (
    <TouchableOpacity
        style={styles.optionLink}
        onPress={onPress}
        activeOpacity={0.5}>
        <View style={styles.optionTextContainer}>
            <Text style={{color: color || undefined}}>{children}</Text>
        </View>
        <View style={styles.optionIconContainer}>
            <Feather
                name="chevron-right"
                size={18}
                color={color || undefined}
            />
        </View>
    </TouchableOpacity>
);

const Options = ({
    navigation,
}: StackScreenProps<OptionsStackParamList, 'OptionsHome'>) => {
    const dispatch = useAppDispatch();

    const logout = async () => {
        await dispatch(LOGOUT());
    };

    return (
        <View>
            <View style={styles.optionsGroup}>
                <OptionItem
                    onPress={() => {
                        navigation.navigate('Account');
                    }}>
                    Account
                </OptionItem>
                <OptionItem
                    onPress={() => {
                        navigation.navigate('DeletedProducts');
                    }}>
                    Deleted Products
                </OptionItem>
            </View>
            <View style={styles.optionsGroup}>
                <OptionItem
                    onPress={() => {
                        navigation.navigate('AppInfo');
                    }}>
                    App Info
                </OptionItem>
                <OptionItem onPress={logout} color="#ce3b54">
                    Logout
                </OptionItem>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    logoutButton: {
        maxWidth: 100,
        borderColor: 'black',
        borderWidth: 2,
        borderRadius: 3,
        padding: 5,
        alignSelf: 'center',
        backgroundColor: '#fff',
    },
    optionsGroup: {
        marginVertical: 10,
        borderRadius: 3,
    },
    optionLink: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
    },
    optionTextContainer: {
        flex: 1,
    },
    optionIconContainer: {
        flex: 1,
        alignSelf: 'flex-end',
        flexBasis: 18,
        flexGrow: 0,
        flexShrink: 0,
    },
});

export default Options;
