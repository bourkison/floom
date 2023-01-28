import React, {useState} from 'react';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {View, StyleSheet, Text, Modal, Pressable} from 'react-native';
import {PALETTE} from '@/constants';

const DeleteAccountWidget = () => {
    const [modalVisible, setModalVisible] = useState(false);

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
                    style={{flex: 1}}>
                    <View>
                        <Text>Modal</Text>
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
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
    },
});

export default DeleteAccountWidget;
