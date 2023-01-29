import React, {RefObject, useEffect, useState, useCallback} from 'react';
import {
    Modal,
    Pressable,
    StyleSheet,
    TouchableOpacity,
    View,
} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {GENDER_OPTIONS, PALETTE} from '@/constants';
import {UserDocData} from '@/types/user';

type SetGenderProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: UserDocData['gender'] | '';
    setSelectedValue: (gender: UserDocData['gender']) => void;
    touchableRef: RefObject<TouchableOpacity>;
};

const SetGender: React.FC<SetGenderProps> = ({
    visible,
    setVisible,
    selectedValue,
    setSelectedValue,
    touchableRef,
}) => {
    const BORDER_WIDTH = 1;
    const [modalTop, setModalTop] = useState(0);

    const measureModalTop = useCallback(() => {
        if (touchableRef && touchableRef.current) {
            touchableRef.current.measure(
                (x, y, width, height, pageX, pageY) => {
                    console.log('setting modal top:', pageY + height + 1);
                    setModalTop(pageY + height + BORDER_WIDTH);
                },
            );
        }
    }, [touchableRef]);

    useEffect(() => {
        if (visible && modalTop <= BORDER_WIDTH) {
            measureModalTop();
        }
    }, [visible, modalTop, measureModalTop]);

    // Set to first value on open if nothing yet selected.
    useEffect(() => {
        if (!selectedValue && visible) {
            setSelectedValue('male');
        }
    }, [selectedValue, setSelectedValue, visible]);

    return (
        <View onLayout={measureModalTop}>
            <Modal visible={visible} transparent={true}>
                <Pressable
                    style={styles.pressableContainer}
                    onPress={() => setVisible(false)}>
                    <Pressable style={[styles.modalContainer, {top: modalTop}]}>
                        <Picker
                            selectedValue={selectedValue || 'male'}
                            onValueChange={setSelectedValue}>
                            {GENDER_OPTIONS.map(g => (
                                <Picker.Item
                                    value={g.value}
                                    label={g.label}
                                    key={g.value}
                                />
                            ))}
                        </Picker>
                    </Pressable>
                </Pressable>
            </Modal>
        </View>
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
