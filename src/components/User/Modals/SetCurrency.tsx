import React, {useState, useEffect, RefObject, useCallback} from 'react';
import {
    TouchableOpacity,
    Modal,
    Pressable,
    StyleSheet,
    View,
} from 'react-native';
import {CURRENCIES} from '@/constants/countries';
import {PALETTE} from '@/constants';
import {Picker} from '@react-native-picker/picker';

type SetCurrencyProps = {
    visible: boolean;
    setVisible: (visible: boolean) => void;
    selectedValue: keyof typeof CURRENCIES | '';
    setSelectedValue: (currency: keyof typeof CURRENCIES) => void;
    touchableRef: RefObject<TouchableOpacity>;
};

const SetCurrency: React.FC<SetCurrencyProps> = ({
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

    // Set to first value on open if nothing yet selected.
    useEffect(() => {
        if (!selectedValue && visible) {
            setSelectedValue('USD');
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
                            selectedValue={selectedValue || 'USD'}
                            onValueChange={setSelectedValue}>
                            {Object.values(CURRENCIES).map(c => (
                                <Picker.Item
                                    key={c.code}
                                    value={c.code}
                                    label={c.emoji + ' ' + c.name}
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

export default SetCurrency;
