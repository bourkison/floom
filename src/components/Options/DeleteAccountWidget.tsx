import React, {useState} from 'react';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {View, StyleSheet, Text, Modal, Pressable} from 'react-native';
import {PALETTE} from '@/constants';
import SectionHeader from '../Utility/SectionHeader';
import Spinner from '../Utility/Spinner';

const DeleteAccountWidget = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const deleteAccount = () => {
        setIsLoading(true);
    };

    return (
        <View>
            <View style={styles.buttonContainer}>
                <AnimatedButton
                    onPress={() => setModalVisible(true)}
                    style={styles.deleteAccountButton}
                    textStyle={styles.deleteAccountButtonText}>
                    Delete Account
                </AnimatedButton>
            </View>
            <Text style={styles.hintText}>
                WARNING: Deleted accounts can not be recovered.
            </Text>
            <Modal visible={modalVisible} transparent={true}>
                <Pressable
                    onPress={() => setModalVisible(false)}
                    style={styles.modalPressable}>
                    <View style={styles.modalContainer}>
                        <View>
                            <SectionHeader>Delete Account</SectionHeader>
                            <Text style={styles.modalText}>
                                Are you sure you want to delete your account?
                                There is no going back.
                            </Text>
                        </View>
                        <View style={styles.modalButtonsContainer}>
                            <View style={styles.modalButtonContainer}>
                                <AnimatedButton
                                    style={styles.goBackButton}
                                    textStyle={styles.goBackButtonText}
                                    onPress={() => setModalVisible(false)}>
                                    Go Back
                                </AnimatedButton>
                            </View>
                            <View style={styles.modalButtonContainer}>
                                <AnimatedButton
                                    style={styles.confirmButton}
                                    textStyle={styles.confirmButtonText}
                                    onPress={deleteAccount}>
                                    {isLoading ? (
                                        <Spinner
                                            diameter={14}
                                            spinnerWidth={2}
                                            backgroundColor="#1a1f25"
                                            spinnerColor="#f3fcfa"
                                        />
                                    ) : (
                                        'Delete'
                                    )}
                                </AnimatedButton>
                            </View>
                        </View>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        padding: 10,
    },
    modalPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        width: '100%',
        padding: 10,
        borderRadius: 5,
        shadowColor: PALETTE.neutral[6],
        shadowOpacity: 0.6,
    },
    modalText: {
        color: PALETTE.neutral[6],
        fontSize: 12,
        marginVertical: 5,
    },
    modalButtonsContainer: {flexDirection: 'row', width: '100%'},
    modalButtonContainer: {flex: 1, padding: 5},
    deleteAccountButton: {
        padding: 7,
        backgroundColor: PALETTE.red[7],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    deleteAccountButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    confirmButton: {
        padding: 7,
        backgroundColor: PALETTE.red[7],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    confirmButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    goBackButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    goBackButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
    },
});

export default DeleteAccountWidget;
