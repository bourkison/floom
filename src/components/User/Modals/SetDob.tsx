import React, {useState, useEffect, RefObject} from 'react';
import {Modal, Pressable, TouchableOpacity, StyleSheet} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {PALETTE} from '@/constants';

type SetDobProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: Date;
    setSelectedValue: (d: Date) => void;
    touchableRef: RefObject<TouchableOpacity>;
};

const SetDob: React.FC<SetDobProps> = ({
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
                    setModalTop(pageY + height + 1);
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
                    <DateTimePicker
                        value={new Date(selectedValue)}
                        display="spinner"
                        onChange={(e, d) => {
                            setSelectedValue(d || new Date());
                        }}
                    />
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

export default SetDob;
