import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Feather, AntDesign, Ionicons} from '@expo/vector-icons';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {COMMENCE_ANIMATE} from '@/store/slices/product';
import {
    SAVE_COLOR,
    BUY_COLOR,
    DELETE_COLOR,
    ACTION_BUTTON_SIZE_ACTIVE,
    ACTION_BUTTON_SIZE_INACTIVE,
    PALETTE,
} from '@/constants';
import AnimatedButton from '@/components/Utility/AnimatedButton';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    onPress?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({type, onPress}) => {
    const dispatch = useAppDispatch();
    const action = useAppSelector(state => state.product.action);

    const press = () => {
        if (onPress) {
            onPress();
        } else {
            dispatch(COMMENCE_ANIMATE(type));
        }
    };

    if (type === 'save') {
        return (
            <View
                style={[
                    styles.buttonContainer,
                    action === type ? styles.noShadow : styles.shadow,
                ]}>
                <AnimatedButton
                    scale={1}
                    style={{
                        ...styles.actionButton,
                        borderRadius:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE / 2
                                : ACTION_BUTTON_SIZE_INACTIVE / 2,
                        width:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE
                                : ACTION_BUTTON_SIZE_INACTIVE,
                        height:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE
                                : ACTION_BUTTON_SIZE_INACTIVE,
                        borderColor: PALETTE.lime[4],
                        backgroundColor:
                            action === type ? SAVE_COLOR : PALETTE.neutral[0],
                    }}
                    onPress={press}>
                    <View style={styles.button}>
                        <Ionicons
                            name="heart"
                            size={ACTION_BUTTON_SIZE_ACTIVE / 2}
                            color={
                                action === type ? PALETTE.slate[0] : SAVE_COLOR
                            }
                        />
                    </View>
                </AnimatedButton>
            </View>
        );
    }

    if (type === 'buy') {
        return (
            <View
                style={[
                    styles.buttonContainer,
                    action === type ? styles.noShadow : styles.shadow,
                ]}>
                <AnimatedButton
                    scale={1}
                    style={{
                        ...styles.actionButton,
                        borderRadius:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE / 2
                                : ACTION_BUTTON_SIZE_INACTIVE / 2,
                        width:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE
                                : ACTION_BUTTON_SIZE_INACTIVE,
                        height:
                            action === type
                                ? ACTION_BUTTON_SIZE_ACTIVE
                                : ACTION_BUTTON_SIZE_INACTIVE,
                        borderColor: PALETTE.blue[4],
                        backgroundColor:
                            action === type ? BUY_COLOR : PALETTE.neutral[0],
                    }}
                    onPress={press}>
                    <View style={styles.button}>
                        <AntDesign
                            name="shoppingcart"
                            size={ACTION_BUTTON_SIZE_ACTIVE / 2}
                            color={
                                action === type ? PALETTE.slate[0] : BUY_COLOR
                            }
                        />
                    </View>
                </AnimatedButton>
            </View>
        );
    }

    return (
        <View
            style={[
                styles.buttonContainer,
                action === type ? styles.noShadow : styles.shadow,
            ]}>
            <AnimatedButton
                scale={1}
                style={{
                    ...styles.actionButton,
                    borderRadius:
                        action === type
                            ? ACTION_BUTTON_SIZE_ACTIVE / 2
                            : ACTION_BUTTON_SIZE_INACTIVE / 2,
                    width:
                        action === type
                            ? ACTION_BUTTON_SIZE_ACTIVE
                            : ACTION_BUTTON_SIZE_INACTIVE,
                    height:
                        action === type
                            ? ACTION_BUTTON_SIZE_ACTIVE
                            : ACTION_BUTTON_SIZE_INACTIVE,
                    borderColor: PALETTE.rose[4],
                    backgroundColor:
                        action === type ? DELETE_COLOR : PALETTE.neutral[0],
                }}
                onPress={press}>
                <View style={styles.button}>
                    <Feather
                        name="x"
                        size={ACTION_BUTTON_SIZE_ACTIVE / 2}
                        color={
                            action === type ? PALETTE.slate[0] : DELETE_COLOR
                        }
                    />
                </View>
            </AnimatedButton>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        height: ACTION_BUTTON_SIZE_INACTIVE,
        width: ACTION_BUTTON_SIZE_INACTIVE,
        marginHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: PALETTE.slate[7],
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    actionButton: {
        zIndex: -1,
        borderWidth: 1,
    },
    button: {
        flex: 1,
        justifyContent: 'center',
        alignContent: 'center',
        alignItems: 'center',
        zIndex: -1,
    },
    noShadow: {
        shadowOpacity: 0,
    },
    shadow: {
        shadowOpacity: 0.4,
    },
});

export default ActionButton;
