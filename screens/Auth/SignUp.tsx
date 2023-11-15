import {StackScreenProps} from '@react-navigation/stack';
// import dayjs from 'dayjs';
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

import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {AuthStackParamList} from '@/nav/Navigator';
import {supabase} from '@/services/supabase';
// import {Database} from '@/types/schema';

// type UserRow = Database['public']['Tables']['users']['Row'];

const SIGN_UP_STAGES = [
    'name',
    'email',
    'password',
    'confPassword',
    'verify',
    'dob',
] as const;
// const MIN_AGE = dayjs().subtract(16, 'year').toDate();
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

const SignUp = (_: StackScreenProps<AuthStackParamList, 'SignUp'>) => {
    const [pageIndex, setPageIndex] = useState(0);
    const transitionDirection = useSharedValue<'next' | 'previous' | ''>('');

    const [isLoading, setIsLoading] = useState(false);

    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    // const [dob, setDob] = useState(MIN_AGE);
    // const [gender, setGender] = useState<UserRow['gender'] | ''>('');

    const [password, setPassword] = useState('');
    const [confPassword, setConfPassword] = useState('');

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

        const verifyIndex = SIGN_UP_STAGES.findIndex(val => val === 'verify');
        setPageIndex(verifyIndex);

        console.log('data', data);
    };

    const nextPage = () => {
        transitionDirection.value = 'next';

        if (pageIndex + 2 > SIGN_UP_STAGES.length) {
            console.error('Trying to increment pageIndex above page amount');
            return;
        }

        setPageIndex(pageIndex + 1);
    };

    const previousPage = () => {
        transitionDirection.value = 'previous';

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
                    paddingBottom: bottom,
                    paddingLeft: left,
                    paddingRight: right,
                },
            ]}>
            {pageIndex === 0 && (
                <Animated.View
                    style={styles.section}
                    entering={CustomEnterAnimation}
                    exiting={CustomExitAnimation}>
                    <View style={styles.box}>
                        <TextInput
                            autoComplete="name"
                            autoCorrect={false}
                            value={name}
                            style={styles.textInput}
                            onChangeText={setName}
                            onSubmitEditing={nextPage}
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
                    style={styles.section}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={styles.box}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect={false}
                            value={email}
                            keyboardType="email-address"
                            style={styles.textInput}
                            onChangeText={setEmail}
                            onSubmitEditing={nextPage}
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
                    style={styles.section}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={styles.box}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                            secureTextEntry
                            value={password}
                            style={styles.textInput}
                            onChangeText={setPassword}
                            onSubmitEditing={nextPage}
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
                    style={styles.section}
                    exiting={CustomExitAnimation}
                    entering={CustomEnterAnimation}>
                    <View style={styles.box}>
                        <TextInput
                            autoCapitalize="none"
                            autoComplete="off"
                            autoCorrect={false}
                            secureTextEntry
                            value={confPassword}
                            style={styles.textInput}
                            onChangeText={setConfPassword}
                            onSubmitEditing={nextPage}
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
                                // disabled={isLoading}
                            >
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
            {/* <ScrollView>
                <View style={styles.section}>
                    <SectionHeader>Details</SectionHeader>
                    <UpdateDetailsWidget
                        name={name}
                        setName={setName}
                        gender={gender}
                        setGender={setGender}
                        dob={dob}
                        setDob={setDob}
                        isUpdate={false}
                    />
                </View>
                <View style={[styles.section, styles.topMargin]}>
                    <SectionHeader>Password</SectionHeader>
                    <UpdatePasswordWidget
                        isUpdate={false}
                        newPassword={password}
                        setNewPassword={setPassword}
                        confirmNewPassword={confPassword}
                        setConfirmNewPassword={setConfPassword}
                    />
                </View>
                <View style={styles.buttonsContainer}>
                    <AnimatedButton
                        style={styles.button}
                        textStyle={styles.buttonText}
                        onPress={signUp}
                        disabled={isLoading}>
                        {isLoading ? <ActivityIndicator /> : 'Sign Up'}
                    </AnimatedButton>
                </View>
            </ScrollView> */}
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
    section: {paddingHorizontal: 25, width: '100%'},
    box: {},
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
