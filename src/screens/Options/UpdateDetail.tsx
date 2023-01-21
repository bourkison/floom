import {OptionsStackParamList} from '@/nav/OptionsNavigator';
import {useAppSelector} from '@/store/hooks';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useState} from 'react';
import {View, Text, TextInput, StyleSheet} from 'react-native';
import {PALETTE} from '@/constants';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import SectionHeader from '@/components/Utility/SectionHeader';

const UpdateDetail: React.FC<
    StackScreenProps<OptionsStackParamList, 'UpdateDetail'>
> = ({route}) => {
    const user = useAppSelector(state => state.user.docData);

    const [isLoading, setIsLoading] = useState(false);

    const [name, setName] = useState(user?.name || '');

    const updateUser = () => {
        setIsLoading(!isLoading);
        console.log(name);
    };

    switch (route.params.type) {
        case 'email':
            return (
                <View>
                    <SectionHeader>Email</SectionHeader>
                    <Text>{user?.email || ''}</Text>
                    <Text>Email can not be updated.</Text>
                </View>
            );
        case 'name':
            return (
                <View>
                    <Text>Name</Text>
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
                            editable={!isLoading}
                        />
                    </View>
                    <View style={styles.buttonContainer}>
                        <AnimatedButton
                            onPress={updateUser}
                            style={styles.updateButton}
                            textStyle={styles.updateButtonText}
                            disabled={isLoading}>
                            {isLoading ? (
                                <Spinner
                                    diameter={14}
                                    spinnerWidth={2}
                                    backgroundColor="#1a1f25"
                                    spinnerColor="#f3fcfa"
                                />
                            ) : (
                                'Update Name'
                            )}
                        </AnimatedButton>
                    </View>
                </View>
            );
        default:
            return <View />;
    }
};

const styles = StyleSheet.create({
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
});

export default UpdateDetail;
