import DateTimePicker from '@react-native-community/datetimepicker';
import {StackScreenProps} from '@react-navigation/stack';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, {useState} from 'react';
import {
    StyleSheet,
    View,
    Text,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import Animated, {
    Easing,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
    useSharedValue,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import SetGender from '@/components/User/SetGender';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {MIN_AGE, PALETTE} from '@/constants';
import {RootStackParamList} from '@/nav/types';
import {supabase} from '@/services/supabase';
import {Gender} from '@/types';

export const SIGN_UP_STAGES = [
    'name',
    'email',
    'password',
    'confPassword',
    'verify',
    'additionalInfo',
] as const;
const MIN_AGE_DOB = dayjs().subtract(MIN_AGE, 'year').toDate();
const ANIMATION_DURATION = 400;

// TODO: Find a better way to do this for initial load.
const instantAnimation = new SlideInRight().duration(0).build();

const slideInLeftAnimation = new SlideInLeft()
    .easing(Easing.quad)
    .duration(ANIMATION_DURATION)
    .build();
const slideInRightAnimation = new SlideInRight()
    .easing(Easing.quad)
    .duration(ANIMATION_DURATION)
    .build();

const slideOutLeftAnimation = new SlideOutLeft()
    .easing(Easing.quad)
    .duration(ANIMATION_DURATION)
    .build();
const slideOutRightAnimation = new SlideOutRight()
    .easing(Easing.quad)
    .duration(ANIMATION_DURATION)
    .build();

dayjs.extend(advancedFormat);

const SignUp = ({route}: StackScreenProps<RootStackParamList, 'SignUp'>) => {
    const [pageIndex, setPageIndex] = useState(route.params.startPageIndex);
    const transitionDirection = useSharedValue<'next' | 'previous' | ''>('');

    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');
    const [token, setToken] = useState('');
    const [gender, setGender] = useState<Gender>('both');
    const [dob, setDob] = useState(MIN_AGE_DOB);
    const [userId, setUserId] = useState('');

    const {top, bottom, left, right} = useSafeAreaInsets();

    const CustomEnterAnimation = (values: any) => {
        'worklet';

        if (transitionDirection.value === '') {
            return instantAnimation(values);
        }

        return transitionDirection.value === 'next'
            ? slideInRightAnimation(values)
            : slideInLeftAnimation(values);
    };

    const CustomExitAnimation = (values: any) => {
        'worklet';

        return transitionDirection.value === 'next'
            ? slideOutLeftAnimation(values)
            : slideOutRightAnimation(values);
    };

    const supabaseSignUp = async () => {
        setIsLoading(true);

        const {data, error} = await supabase.auth.signUp({email, password});

        setIsLoading(false);

        if (error) {
            console.error(error);
            return;
        }

        setUserId(data.user?.id || '');

        const verifyIndex = SIGN_UP_STAGES.findIndex(val => val === 'verify');
        setPageIndex(verifyIndex);

        console.log('data', data);
    };

    const createUser = async () => {
        setIsLoading(true);

        console.log('CREATING WITH:', {
            id: userId,
            dob: dayjs(dob).format('YYYY-MM-D'),
            email,
            gender,
            name,
        });

        const {data, error} = await supabase.from('users').insert({
            id: userId,
            dob: dayjs(dob).format('YYYY-MM-D'),
            email,
            gender,
            name,
        });

        if (error) {
            console.error(error);
            return;
        }

        console.log('SUCCESSFUL CREATION', data);
    };

    const verify = async () => {
        setIsLoading(true);

        const {data, error} = await supabase.auth.verifyOtp({
            email,
            token,
            type: 'email',
        });

        if (error) {
            console.error(error);
            // TODO: THIS NEEDS TO CHANGE IN PRODUCTION.
            // return;
        }

        const {data: loginData, error: loginError} =
            await supabase.auth.signInWithPassword({email, password});

        setIsLoading(false);

        if (loginError) {
            console.error('LOGIN ERROR:', loginError);
            return;
        }

        console.log('verify data', data);
        console.log('login data', loginData);

        const additionalInfoIndex = SIGN_UP_STAGES.findIndex(
            val => val === 'additionalInfo',
        );
        setPageIndex(additionalInfoIndex);
    };

    const nextPage = () => {
        transitionDirection.value = 'next';

        const confPasswordIndex = SIGN_UP_STAGES.findIndex(
            val => val === 'confPassword',
        );
        const verifyIndex = SIGN_UP_STAGES.findIndex(val => val === 'verify');
        const additionalInfoIndex = SIGN_UP_STAGES.findIndex(
            val => val === 'additionalInfo',
        );

        if (pageIndex === confPasswordIndex) {
            console.warn('Attempting to move next page on confPasswordIndex');
            return;
        }

        if (pageIndex === verifyIndex) {
            console.warn('Attempting to move next page on verifyIndex');
            return;
        }

        if (pageIndex === additionalInfoIndex) {
            console.warn('Attempting to move next page on additionalInfoIndex');
            return;
        }

        if (pageIndex + 2 > SIGN_UP_STAGES.length) {
            console.error('Trying to increment pageIndex above page amount');
            return;
        }

        setPageIndex(pageIndex + 1);
    };

    const previousPage = () => {
        transitionDirection.value = 'previous';

        const verifyIndex = SIGN_UP_STAGES.findIndex(val => val === 'verify');
        const additionalInfoIndex = SIGN_UP_STAGES.findIndex(
            val => val === 'additionalInfo',
        );

        if (pageIndex === verifyIndex) {
            console.warn('Attempting to move previous page on verifyIndex');
            return;
        }

        if (pageIndex === additionalInfoIndex) {
            console.warn(
                'Attempting to move previous page on additionalInfoIndex',
            );
            return;
        }

        if (pageIndex - 1 < 0) {
            console.error('Trying to increment pageIndex below 0');
            return;
        }

        setPageIndex(pageIndex - 1);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: top,
                    paddingLeft: left,
                    paddingRight: right,
                },
            ]}>
            {pageIndex === 0 && (
                <Animated.View
                    style={[styles.section, {paddingBottom: bottom}]}
                    entering={CustomEnterAnimation}
                    exiting={CustomExitAnimation}>
                    <View style={[styles.box]}>
                        <TextInput
                            autoComplete="name"
                            autoCorrect={false}
                            value={name}
                            style={styles.textInput}
                            onChangeText={setName}
                            onSubmitEditing={nextPage}
                            returnKeyType="next"
                        />
                    </View>
                    <Text style={styles.hintText}>
                        Your name can not be changed later.
                    </Text>

                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={nextPage}>
                                Next
                            </AnimatedButton>
                        </View>
                    </View>
                </Animated.View>
            )}

            {pageIndex === 1 && (
                <Animated.View
                    style={[styles.section, {paddingBottom: bottom}]}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={[styles.box]}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect={false}
                            value={email}
                            keyboardType="email-address"
                            style={styles.textInput}
                            onChangeText={setEmail}
                            onSubmitEditing={nextPage}
                            returnKeyType="next"
                        />
                    </View>
                    <Text style={styles.hintText}>
                        Your email can not be changed later.
                    </Text>
                    {/* <Text style={styles.hintText}>
                        We promise not to send you marketing emails (unless you
                        want us to).
                    </Text> */}

                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.previousButton}
                                textStyle={styles.previousButtonText}
                                onPress={previousPage}>
                                Previous
                            </AnimatedButton>
                        </View>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={nextPage}>
                                Next
                            </AnimatedButton>
                        </View>
                    </View>
                </Animated.View>
            )}

            {pageIndex === 2 && (
                <Animated.View
                    style={[styles.section, {paddingBottom: bottom}]}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={[styles.box]}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                            secureTextEntry
                            value={password}
                            style={styles.textInput}
                            onChangeText={setPassword}
                            onSubmitEditing={nextPage}
                            returnKeyType="next"
                        />
                    </View>

                    <Text style={styles.hintText}>
                        Set your password, we'll ask you to confirm it next
                        page.
                    </Text>

                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.previousButton}
                                textStyle={styles.previousButtonText}
                                onPress={previousPage}>
                                Previous
                            </AnimatedButton>
                        </View>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={nextPage}>
                                Next
                            </AnimatedButton>
                        </View>
                    </View>
                </Animated.View>
            )}

            {pageIndex === 3 && (
                <Animated.View
                    style={[styles.section, {paddingBottom: bottom}]}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={[styles.box]}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                            secureTextEntry
                            value={confPassword}
                            style={styles.textInput}
                            onChangeText={setConfPassword}
                            onSubmitEditing={supabaseSignUp}
                            returnKeyType="next"
                        />
                    </View>
                    <Text style={styles.hintText}>Confirm your password.</Text>

                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.previousButton}
                                textStyle={styles.previousButtonText}
                                onPress={previousPage}>
                                Previous
                            </AnimatedButton>
                        </View>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={supabaseSignUp}
                                disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size={14} />
                                ) : (
                                    'Create Account'
                                )}
                            </AnimatedButton>
                        </View>
                    </View>
                </Animated.View>
            )}

            {pageIndex === 4 && (
                <Animated.View
                    style={[styles.section, {paddingBottom: bottom}]}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={[styles.box]}>
                        <TextInput
                            autoComplete="off"
                            autoCapitalize="characters"
                            autoCorrect={false}
                            value={token}
                            style={styles.textInput}
                            onChangeText={setToken}
                            onSubmitEditing={verify}
                            returnKeyType="next"
                        />
                    </View>
                    <Text style={styles.hintText}>Verify email</Text>

                    <View style={styles.buttonsContainer}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={verify}
                                disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size={14} />
                                ) : (
                                    'Verify'
                                )}
                            </AnimatedButton>
                        </View>
                    </View>
                </Animated.View>
            )}

            {pageIndex === 5 && (
                <Animated.View
                    style={{flex: 1, width: '100%'}}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={[styles.section, {flex: 1}]}>
                        <SetGender onChange={setGender} value={gender} />

                        <View style={{width: '100%', marginTop: 25}}>
                            <Text>Date of Birth</Text>
                            <Text>{dayjs(dob).format('Do of MMMM, YYYY')}</Text>
                        </View>
                    </View>

                    <View style={[styles.buttonsContainer, {marginBottom: 25}]}>
                        <View style={styles.buttonContainer}>
                            <AnimatedButton
                                style={styles.nextButton}
                                textStyle={styles.nextButtonText}
                                onPress={createUser}
                                disabled={isLoading}>
                                {isLoading ? (
                                    <ActivityIndicator size={14} />
                                ) : (
                                    'Finish'
                                )}
                            </AnimatedButton>
                        </View>
                    </View>

                    <View
                        style={{
                            width: '100%',
                        }}>
                        <DateTimePicker
                            maximumDate={MIN_AGE_DOB}
                            value={dob}
                            mode="date"
                            display="spinner"
                            onChange={(_, d) => d && setDob(d)}
                        />
                    </View>
                </Animated.View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[9],
        borderBottomWidth: 3,
        textAlign: 'center',
    },
    section: {
        paddingHorizontal: 25,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    box: {
        width: '100%',
    },
    inputHeader: {
        textTransform: 'uppercase',
        color: PALETTE.rose[4],
        paddingHorizontal: 10,
        fontWeight: '600',
        borderColor: PALETTE.neutral[2],
    },
    borderTop: {
        borderTopWidth: 1,
    },
    topMargin: {
        marginTop: 20,
    },
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        marginTop: 3,
    },
    nextButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginLeft: 10,
    },
    nextButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    previousButton: {
        padding: 7,
        borderColor: PALETTE.neutral[9],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        marginRight: 10,
        alignSelf: 'center',
    },
    previousButtonText: {
        color: PALETTE.neutral[9],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    buttonContainer: {flex: 1},
    buttonsContainer: {
        paddingHorizontal: 10,
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default SignUp;
