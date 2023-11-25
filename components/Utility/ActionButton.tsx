import {Ionicons, MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import React, {useCallback, useEffect} from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';

import {
    SAVE_COLOR,
    BUY_COLOR,
    DELETE_COLOR,
    ACTION_BUTTON_SIZE,
    PALETTE,
} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {commenceAnimate, setAction} from '@/store/slices/product';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    onPress?: () => void;
    disabled: boolean;
};

const SCALE_AMOUNT = 0.9;

const BOX_SHADOW_START = 0.5;
const BOX_SHADOW_END = 0.4;
const BORDER_WIDTH = 4;

const PROGRESS_DURATION = 250;

const ActionButton: React.FC<ActionButtonProps> = ({
    type,
    onPress,
    disabled,
}) => {
    const dispatch = useAppDispatch();
    const action = useAppSelector(state => state.product.action);

    // Goes from 0 to 1 based on progress.
    const sProgress = useSharedValue(0);

    const activeColor = useCallback(() => {
        if (type === 'save') {
            return SAVE_COLOR;
        } else if (type === 'buy') {
            return BUY_COLOR;
        } else {
            return DELETE_COLOR;
        }
    }, [type]);

    const ACTIVE_COLOR = activeColor();

    const rStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            sProgress.value,
            [0, 1],
            ['#FFF', ACTIVE_COLOR],
        );

        const borderColor = interpolateColor(
            sProgress.value,
            [0, 1],
            [PALETTE.neutral[0], ACTIVE_COLOR],
        );

        return {
            transform: [
                {
                    // Goes from 1 to SCALE_AMOUNT based on progress
                    scale: 1 - (1 - SCALE_AMOUNT) * sProgress.value,
                },
            ],
            // Goes from 0.5 to 0.4 based on progress
            shadowOpacity:
                BOX_SHADOW_START - (1 - BOX_SHADOW_END) * sProgress.value,
            elevation: 5 - sProgress.value * 5,
            borderColor,
            backgroundColor,
        };
    });

    const icon = useCallback(() => {
        if (type === 'save') {
            return (
                <Ionicons
                    name="heart"
                    color={action === type ? PALETTE.neutral[1] : ACTIVE_COLOR}
                    size={ACTION_BUTTON_SIZE / 2.5}
                />
            );
        } else if (type === 'buy') {
            return (
                <MaterialCommunityIcons
                    name="cart"
                    size={ACTION_BUTTON_SIZE / 2}
                    color={action === type ? PALETTE.neutral[1] : ACTIVE_COLOR}
                />
            );
        } else {
            return (
                <Octicons
                    name="x"
                    size={ACTION_BUTTON_SIZE / 2}
                    color={action === type ? PALETTE.neutral[1] : ACTIVE_COLOR}
                />
            );
        }
    }, [type, action, ACTIVE_COLOR]);

    useEffect(() => {
        if (action === type) {
            sProgress.value = withTiming(1, {duration: PROGRESS_DURATION});
        } else {
            sProgress.value = withTiming(0, {duration: PROGRESS_DURATION});
        }
    }, [action, sProgress, type]);

    const press = () => {
        Haptics.impactAsync();

        dispatch(setAction(type));

        if (onPress) {
            onPress();
        } else {
            dispatch(commenceAnimate(type));
        }
    };

    return (
        <Animated.View style={[styles.buttonContainer, rStyle]}>
            <Pressable onPress={press} disabled={disabled}>
                <View style={[styles.button]}>{icon()}</View>
            </Pressable>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        marginHorizontal: 8,
        shadowColor: PALETTE.neutral[5],
        borderRadius: ACTION_BUTTON_SIZE / 2 + BORDER_WIDTH,
        borderWidth: BORDER_WIDTH,
        elevation: 5,
    },
    button: {
        zIndex: -1,
        width: ACTION_BUTTON_SIZE - BORDER_WIDTH * 2,
        height: ACTION_BUTTON_SIZE - BORDER_WIDTH * 2,
        flexBasis: ACTION_BUTTON_SIZE - BORDER_WIDTH * 2,
        borderRadius: (ACTION_BUTTON_SIZE - BORDER_WIDTH * 2) / 2,
        flexGrow: 0,
        flexShrink: 0,
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
});

export default ActionButton;