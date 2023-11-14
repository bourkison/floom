import {FontAwesome5} from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import dayjs from 'dayjs';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import React, {useRef, useState} from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Text,
    ActivityIndicator,
} from 'react-native';

// import {useAppDispatch, useAppSelector} from '@/store/hooks';
import SetGender from '@/components/User/Modals/SetGender';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE, GENDER_OPTIONS} from '@/constants';
import {Database} from '@/types/schema';

type UserRow = Database['public']['Tables']['users']['Row'];

type UpdateDetailsWidgetProps = {
    name: string;
    setName: (name: string) => void;
    gender: UserRow['gender'] | '';
    setGender: (gender: UserRow['gender']) => void;
    dob: Date;
    setDob: (dob: Date) => void;
    isUpdate: boolean;
};

dayjs.extend(advancedFormat);
const MAX_DATE = dayjs().subtract(16, 'year').toDate();

const UpdateDetailsWidget: React.FC<UpdateDetailsWidgetProps> = ({
    name,
    setName,
    gender,
    setGender,
    dob,
    setDob,
    isUpdate,
}) => {
    const [isLoading] = useState(false);

    // const user = useAppSelector(state => state.user.docData);
    // const dispatch = useAppDispatch();

    const GenderTouchableRef = useRef<TouchableOpacity>(null);
    const [genderModalVisible, setGenderModalVisible] = useState(false);

    const DobTouchableRef = useRef<TouchableOpacity>(null);

    const updateUser = async () => {};

    return (
        <View>
            <View style={styles.box}>
                <TextInput
                    placeholder="Name"
                    placeholderTextColor={PALETTE.neutral[3]}
                    onChangeText={setName}
                    autoCapitalize="sentences"
                    autoComplete="name"
                    autoCorrect={false}
                    value={name}
                    style={styles.textInput}
                />
                <TouchableOpacity
                    ref={GenderTouchableRef}
                    style={[styles.textInput, styles.borderTop]}
                    onPress={() => setGenderModalVisible(true)}>
                    <View style={styles.fdRow}>
                        {gender ? (
                            <Text style={styles.flexOne}>
                                {GENDER_OPTIONS.filter(
                                    g => g.value === gender,
                                )[0]?.label || ''}
                            </Text>
                        ) : (
                            <Text style={[styles.placeholder, styles.flexOne]}>
                                Preferred Style
                            </Text>
                        )}
                        <View style={styles.caretIcon}>
                            {genderModalVisible ? (
                                <FontAwesome5 name="caret-up" />
                            ) : (
                                <FontAwesome5 name="caret-down" />
                            )}
                        </View>
                    </View>
                </TouchableOpacity>
                <SetGender
                    visible={genderModalVisible}
                    setVisible={setGenderModalVisible}
                    selectedValue={gender}
                    setSelectedValue={setGender}
                    touchableRef={GenderTouchableRef}
                />
                <TouchableOpacity
                    ref={DobTouchableRef}
                    style={[styles.textInput, styles.borderTop]}>
                    <View style={styles.fdRow}>
                        <Text style={styles.flexOne}>
                            {dayjs(dob).format('Do MMMM, YYYY')}
                        </Text>
                    </View>
                </TouchableOpacity>
                <DateTimePicker
                    value={dob}
                    mode="date"
                    display="default"
                    maximumDate={MAX_DATE}
                    onChange={(_e, d) => {
                        setDob(d || MAX_DATE);
                    }}
                />
            </View>
            {isUpdate && (
                <View>
                    <View style={styles.buttonContainer}>
                        <AnimatedButton
                            onPress={updateUser}
                            style={styles.updateButton}
                            textStyle={styles.updateButtonText}
                            disabled={isLoading}>
                            {isLoading ? (
                                <ActivityIndicator />
                            ) : (
                                'Update Details'
                            )}
                        </AnimatedButton>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    box: {
        marginTop: 10,
        shadowColor: PALETTE.neutral[5],
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        backgroundColor: PALETTE.neutral[0],
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
    buttonContainer: {
        padding: 10,
    },
    updateButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    updateButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    borderTop: {
        borderTopWidth: 1,
    },
    placeholder: {
        color: PALETTE.neutral[3],
    },
    caretIcon: {paddingRight: 5},
    fdRow: {flexDirection: 'row'},
    flexOne: {flex: 1},
    feedbackContainer: {padding: 10},
});

export default UpdateDetailsWidget;
