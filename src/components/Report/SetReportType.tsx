import React, {useState, useEffect, RefObject} from 'react';
import {Modal, Pressable, TouchableOpacity, StyleSheet} from 'react-native';
import {Picker} from '@react-native-picker/picker';
import {REPORT_TYPES, PALETTE} from '@/constants';

type SetReportTypeProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    touchableRef: RefObject<TouchableOpacity>;
    selectedValue: typeof REPORT_TYPES[number]['id'] | undefined;
    setSelectedValue: (val: typeof REPORT_TYPES[number]['id']) => void;
};

const SetReportType: React.FC<SetReportTypeProps> = ({
    visible,
    touchableRef,
    setVisible,
    selectedValue,
    setSelectedValue,
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

    useEffect(() => {
        if (visible && !selectedValue) {
            setSelectedValue(REPORT_TYPES[0].id);
        }
    }, [visible, selectedValue, setSelectedValue]);

    return (
        <Modal visible={visible} transparent={true}>
            <Pressable
                onPress={() => setVisible(false)}
                style={styles.pressableContainer}>
                <Pressable style={[styles.modalContainer, {top: modalTop}]}>
                    <Picker
                        selectedValue={selectedValue}
                        onValueChange={setSelectedValue}>
                        {REPORT_TYPES.map(t => (
                            <Picker.Item
                                key={t.id}
                                value={t.id}
                                label={t.name}
                            />
                        ))}
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
        backgroundColor: PALETTE.neutral[0],
        shadowColor: PALETTE.neutral[7],
        shadowOpacity: 0.2,
        shadowOffset: {
            width: 0,
            height: 5,
        },
        position: 'absolute',
    },
});

export default SetReportType;
