import React, {useState} from 'react';
import {View, StyleSheet, Text} from 'react-native';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {PALETTE} from '@/constants';
import {useAppDispatch} from '@/store/hooks';
import {LOGOUT} from '@/store/slices/user';

const GuestAccountWidget = () => {
    const [returning, setReturning] = useState(false);

    const dispatch = useAppDispatch();

    const returnToHP = () => {
        setReturning(true);
        dispatch(LOGOUT());
    };

    return (
        <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text style={styles.hintText}>
                    You are logged in as a guest.
                </Text>
                <Text style={styles.hintText}>
                    Create an account below for more features, including
                    unlimited saved and hidden products, as well as smarter
                    recommendations.
                </Text>
            </View>
            <AnimatedButton
                style={styles.createAccountButton}
                textStyle={styles.createAccountButtonText}
                onPress={() => dispatch(LOGOUT())}>
                Create Account with Email
            </AnimatedButton>
            <AnimatedButton
                style={styles.homepageButton}
                textStyle={styles.homepageButtonText}
                onPress={returnToHP}
                disabled={returning}>
                {returning ? (
                    <Spinner
                        diameter={14}
                        spinnerWidth={2}
                        backgroundColor={PALETTE.neutral[8]}
                        spinnerColor={PALETTE.neutral[1]}
                    />
                ) : (
                    'Return to Home Page'
                )}
            </AnimatedButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingBottom: 5,
    },
    createAccountButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    createAccountButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    homepageButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginTop: 5,
    },
    homepageButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    textContainer: {marginBottom: 10},
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        marginTop: 4,
    },
});

export default GuestAccountWidget;
