import React, {useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {PALETTE} from '@/constants';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {LOGOUT} from '@/store/slices/user';
import {useAppDispatch} from '@/store/hooks';

const LogoutWidget = () => {
    const [isLoading, setIsLoading] = useState(false);
    const dispatch = useAppDispatch();

    const logout = async () => {
        setIsLoading(true);
        dispatch(LOGOUT());
    };

    return (
        <View style={styles.container}>
            <AnimatedButton
                style={styles.updatePasswordButton}
                textStyle={styles.updatePasswordButtonText}
                onPress={logout}
                disabled={isLoading}>
                {isLoading ? (
                    <Spinner
                        diameter={14}
                        spinnerWidth={2}
                        backgroundColor={PALETTE.neutral[1]}
                        spinnerColor={PALETTE.neutral[8]}
                    />
                ) : (
                    'Logout'
                )}
            </AnimatedButton>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
    },
    updatePasswordButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[1],
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        flexGrow: 0,
        flexShrink: 0,
        alignSelf: 'center',
    },
    updatePasswordButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default LogoutWidget;
