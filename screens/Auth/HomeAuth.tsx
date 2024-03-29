import {FontAwesome5} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import {Video, ResizeMode} from 'expo-av';
import React, {useRef} from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    useWindowDimensions,
} from 'react-native';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {RootStackParamList} from '@/types/nav';

// Video found here: https://www.pexels.com/video/a-woman-sitting-on-the-chair-8400304/

const HomeAuth = ({
    navigation,
}: StackScreenProps<RootStackParamList, 'HomeAuth'>) => {
    const {height} = useWindowDimensions();
    const VideoRef = useRef<Video>(null);

    const navigateToLogin = () => {
        VideoRef.current?.pauseAsync();
        navigation.navigate('Login');
    };

    const navigateToSignUp = () => {
        VideoRef.current?.pauseAsync();
        navigation.navigate('SignUp', {startPageIndex: 0});
    };

    const navigateToGuest = () => {
        VideoRef.current?.pauseAsync();
        navigation.navigate('GuestWelcome');
    };

    navigation.addListener('focus', () => {
        VideoRef.current?.playAsync();
    });

    return (
        <SafeAreaView style={styles.container}>
            <Video
                source={require('@/assets/homeAuthVid.mp4')}
                style={[styles.backgroundVideo, {height}]}
                resizeMode={ResizeMode.COVER}
                isMuted
                isLooping
                rate={1.0}
                shouldPlay
                ref={VideoRef}
            />
            <View style={styles.guestButtonContainer}>
                <TouchableOpacity
                    style={styles.guestButton}
                    onPress={navigateToGuest}>
                    <Text style={styles.guestText}>Continue as Guest</Text>
                </TouchableOpacity>
            </View>
            <View style={styles.logoContainer}>
                <View>
                    <Text style={styles.logoText}>floom</Text>
                </View>
                <Text style={styles.sloganText}>Shop the revolution™</Text>
            </View>
            <View style={styles.topSectionCont} />
            <View style={styles.buttonsContainer}>
                {/* TODO: Federated Sign In */}
                <View style={styles.continueWithButtonCont}>
                    <AnimatedButton
                        style={styles.continueWithButton}
                        textStyle={styles.continueWithButtonText}
                        onPress={navigateToSignUp}>
                        <View style={styles.continueWithContent}>
                            <View style={styles.iconContainer}>
                                <FontAwesome5
                                    name="apple"
                                    color={PALETTE.gray[1]}
                                />
                            </View>
                            <Text style={styles.continueWithButtonText}>
                                Continue with Apple
                            </Text>
                        </View>
                    </AnimatedButton>
                </View>
                <View style={styles.continueWithButtonCont}>
                    <AnimatedButton
                        style={styles.continueWithButton}
                        textStyle={styles.continueWithButtonText}
                        onPress={navigateToSignUp}>
                        <View style={styles.continueWithContent}>
                            <View style={styles.iconContainer}>
                                <FontAwesome5
                                    name="google"
                                    color={PALETTE.gray[1]}
                                />
                            </View>
                            <Text style={styles.continueWithButtonText}>
                                Continue with Google
                            </Text>
                        </View>
                    </AnimatedButton>
                </View>
                <View style={styles.seperatorContainer}>
                    <View style={styles.seperator} />
                </View>
                <View style={styles.loginButtonCont}>
                    <AnimatedButton
                        style={styles.loginButton}
                        textStyle={styles.loginButtonText}
                        onPress={navigateToSignUp}>
                        Create Account with Email
                    </AnimatedButton>
                </View>
                <View style={styles.signUpButtonCont}>
                    <AnimatedButton
                        style={styles.signUpButton}
                        textStyle={styles.signUpButtonText}
                        onPress={navigateToLogin}>
                        Login
                    </AnimatedButton>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        padding: 10,
    },
    logoContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    logoText: {
        fontFamily: 'JosefinSans-Regular',
        fontSize: 72,
        color: PALETTE.neutral[9],
        letterSpacing: 0,
        textShadowColor: PALETTE.neutral[0],
        shadowOpacity: 0.6,
        shadowColor: PALETTE.neutral[6],
        shadowOffset: {
            width: 0,
            height: 0,
        },
        paddingTop: 20,
        // textTransform: 'uppercase',
    },
    sloganText: {color: PALETTE.neutral[8], marginTop: -5},
    topSectionCont: {flex: 12},
    guestButtonContainer: {
        flex: 1,
        alignItems: 'flex-end',
        width: '100%',
    },
    guestButton: {paddingHorizontal: 10, paddingTop: 15},
    guestText: {fontWeight: '500'},
    buttonsContainer: {
        flex: 4,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 10,
    },
    loginButtonCont: {width: '100%'},
    continueWithButtonCont: {width: '100%', marginTop: 10},
    signUpButtonCont: {width: '100%', marginTop: 5},
    loginButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[9],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    loginButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    continueWithButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[9],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    continueWithButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    continueWithContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    iconContainer: {marginRight: 5},
    signUpButton: {
        padding: 7,
        borderColor: PALETTE.neutral[9],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    signUpButtonText: {
        color: PALETTE.neutral[9],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    backgroundVideo: {
        position: 'absolute',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
    },
    seperatorContainer: {
        paddingHorizontal: 30,
        width: '100%',
        alignSelf: 'center',
        marginVertical: 10,
    },
    seperator: {
        width: '100%',
        borderTopWidth: 1,
        borderColor: PALETTE.neutral[9],
    },
});

export default HomeAuth;
