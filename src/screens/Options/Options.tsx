import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppDispatch} from '@/store/hooks';
import {LOGOUT} from '@/store/slices/user';
import {Feather} from '@expo/vector-icons';

type OptionItemProps = {
    children: string;
    onPress?: () => void;
};

const Options = ({}: StackScreenProps<
    OptionsStackParamList,
    'OptionsHome'
>) => {
    const dispatch = useAppDispatch();

    const logout = async () => {
        await dispatch(LOGOUT());
    };

    const OptionItem: React.FC<OptionItemProps> = ({children, onPress}) => (
        <Pressable style={styles.optionLink} onPress={onPress}>
            <View style={styles.optionTextContainer}>
                <Text>{children}</Text>
            </View>
            <View style={styles.optionIconContainer}>
                <Feather name="chevron-right" size={18} />
            </View>
        </Pressable>
    );

    return (
        <View>
            <View style={styles.optionsGroup}>
                <OptionItem>Account</OptionItem>
                <OptionItem>Deleted Products</OptionItem>
            </View>
            <View style={styles.optionsGroup}>
                <OptionItem>App Info</OptionItem>
                <OptionItem onPress={logout}>Logout</OptionItem>
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
