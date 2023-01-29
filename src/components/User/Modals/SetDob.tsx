import React, {useState, useEffect, RefObject, useCallback} from 'react';
import {
    Modal,
    Pressable,
    TouchableOpacity,
    StyleSheet,
    View,
} from 'react-native';
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
    const BORDER_WIDTH = 1;
    const [modalTop, setModalTop] = useState(0);

    const measureModalTop = useCallback(() => {
        if (touchableRef && touchableRef.current) {
            touchableRef.current.measure(
                (x, y, width, height, pageX, pageY) => {
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

    return (
        <View onLayout={measureModalTop}>
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

export default SetDob;
