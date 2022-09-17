import React from 'react';
import {Pressable, Text, View} from 'react-native';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {StyleSheet} from 'react-native';
import {StackScreenProps} from '@react-navigation/stack';
import {AuthStackParamList} from '@/nav/Navigator';

const GuestWelcome = ({
    navigation,
}: StackScreenProps<AuthStackParamList, 'GuestWelcome'>) => {
    const navigateToSignUp = () => {
        console.log('Sign Up');
    };

    const continueAsGuest = () => {
        console.log('Continue');
    };

    return (
        <View style={styles.container}>
            <View>
                <Text>Welcome to Teender!</Text>
                <Text>
                    We recommend you sign up in order to fully make use of our
                    service.
                </Text>
                <Text>Benefits to signing up include:</Text>
                <Text>- Blah blah blah</Text>
            </View>
            <AnimatedButton
                style={styles.continueButton}
                textStyle={styles.continueButtonText}
                onPress={continueAsGuest}>
                Continue
            </AnimatedButton>
            <Pressable onPress={navigateToSignUp} style={styles.signUpButton}>
                <Text style={styles.signUpButtonText}>Sign Up Instead</Text>
            </Pressable>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingVertical: 5,
        paddingHorizontal: 10,
    },
    continueButton: {
        padding: 15,
        backgroundColor: '#1a1f25',
        flex: 1,
        justifyContent: 'center',
        borderRadius: 25,
        width: '50%',
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 25,
        alignSelf: 'center',
    },
    continueButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        textTransform: 'uppercase',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    signUpButton: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 12,
        marginTop: 10,
        alignSelf: 'center',
    },
    signUpButtonText: {
        color: 'gray',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
});

export default GuestWelcome;
