import React, {useCallback, useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {Feather, AntDesign, Ionicons} from '@expo/vector-icons';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {COMMENCE_ANIMATE, SET_ACTION} from '@/store/slices/product';
import {
    SAVE_COLOR,
    BUY_COLOR,
    DELETE_COLOR,
    ACTION_BUTTON_SIZE_ACTIVE,
    ACTION_BUTTON_SIZE_INACTIVE,
    PALETTE,
} from '@/constants';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    onPress?: () => void;
};

const ActionButton: React.FC<ActionButtonProps> = ({type, onPress}) => {
    const dispatch = useAppDispatch();
    const action = useAppSelector(state => state.product.action);
    const sScale = useSharedValue(1);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: sScale.value,
                },
            ],
            shadowOpacity: sScale.value / 2,
        };
    });

    const activeColor = useCallback(() => {
        if (type === 'save') {
            return SAVE_COLOR;
        } else if (type === 'buy') {
            return BUY_COLOR;
        } else {
            return DELETE_COLOR;
        }
    }, [type]);

    const icon = useCallback(() => {
        if (type === 'save') {
            return (
                <Ionicons
                    name="heart"
                    color={action === type ? PALETTE.neutral[1] : activeColor()}
                    size={ACTION_BUTTON_SIZE_INACTIVE / 2.5}
                />
            );
        } else if (type === 'buy') {
            return (
                <AntDesign
                    name="shoppingcart"
                    size={ACTION_BUTTON_SIZE_ACTIVE / 2}
                    color={action === type ? PALETTE.neutral[1] : activeColor()}
                />
            );
        } else {
            return (
                <Feather
                    name="x"
                    size={ACTION_BUTTON_SIZE_ACTIVE / 2}
                    color={action === type ? PALETTE.neutral[1] : activeColor()}
                />
            );
        }
    }, [type, activeColor, action]);

    useEffect(() => {
        if (action === type) {
            sScale.value = withTiming(0.9, {duration: 150});
        } else {
            sScale.value = withTiming(1, {duration: 150});
        }
    }, [action, sScale, type]);

    const press = () => {
        dispatch(SET_ACTION(type));

        if (onPress) {
            onPress();
        } else {
            dispatch(COMMENCE_ANIMATE(type));
        }
    };

    return (
        <Animated.View style={[styles.buttonContainer, rStyle]}>
            <Pressable onPress={press}>
                <View
                    style={[
                        styles.button,
                        // eslint-disable-next-line react-native/no-inline-styles
                        {
                            backgroundColor:
                                action === type ? activeColor() : '#FFF',
                        },
                    ]}>
                    {icon()}
                </View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        marginHorizontal: 8,
        shadowColor: PALETTE.neutral[5],
    },
    button: {
        zIndex: -1,
        width: ACTION_BUTTON_SIZE_INACTIVE,
        height: ACTION_BUTTON_SIZE_INACTIVE,
        borderRadius: ACTION_BUTTON_SIZE_INACTIVE / 2,
        flexBasis: ACTION_BUTTON_SIZE_INACTIVE,
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    noShadow: {
        shadowOpacity: 0,
    },
    shadow: {
        shadowOpacity: 0.4,
    },
});

export default ActionButton;
