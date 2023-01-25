import React, {RefObject, useEffect, useState} from 'react';
import {Modal, Pressable, StyleSheet, TouchableOpacity} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {PALETTE} from '@/constants';

type SetGenderProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: 'male' | 'female' | 'other';
    setSelectedValue: (gender: 'male' | 'female' | 'other') => void;
    touchableRef: RefObject<TouchableOpacity>;
};

const SetGender: React.FC<SetGenderProps> = ({
    visible,
    setVisible,
    selectedValue,
    setSelectedValue,
    touchableRef,
}) => {
    const [modalTop, setModalTop] = useState(0);

    useEffect(() => {
        if (touchableRef && touchableRef.current) {
            touchableRef.current.measure(
                (x, y, width, height, pageX, pageY) => {
                    console.log('TEST:', x, y, width, height, pageX, pageY);
                    setModalTop(pageY + height);
                },
            );
        }
    }, [touchableRef, visible]);

    return (
        <Modal visible={visible} transparent={true}>
            <Pressable
                style={styles.pressableContainer}
                onPress={() => setVisible(false)}>
                <Pressable style={[styles.modalContainer, {top: modalTop}]}>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={setSelectedValue}>
                        <Picker.Item value="male" label="Male" />
                        <Picker.Item value="female" label="Female" />
                        <Picker.Item value="other" label="Other" />
                    </Picker>
                </Pressable>
            </Pressable>
        </Modal>
    );
};

const styles = StyleSheet.create({
    pressableContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContainer: {
        width: '100%',
        paddingHorizontal: 10,
        alignSelf: 'center',
        backgroundColor: PALETTE.neutral[0],
        borderRadius: 5,
        shadowColor: PALETTE.neutral[7],
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        position: 'absolute',
    },
});

export default SetGender;
