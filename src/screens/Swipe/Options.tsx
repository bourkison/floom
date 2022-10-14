import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {useAppDispatch} from '@/store/hooks';
import {LOGOUT} from '@/store/slices/user';
import AnimatedButton from '@/components/Utility/AnimatedButton';

const Options = ({}: StackScreenProps<MainStackParamList, 'Options'>) => {
    const dispatch = useAppDispatch();

    const logout = async () => {
        await dispatch(LOGOUT());
    };

    return (
        <View>
            <Text>Options</Text>
            <AnimatedButton onPress={logout} style={styles.logoutButton}>
                <View>
                    <Text>Logout</Text>
                </View>
            </AnimatedButton>
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
});

export default Options;
