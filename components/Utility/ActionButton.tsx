import {Ionicons, MaterialCommunityIcons, Octicons} from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import React, {useMemo} from 'react';
import {Pressable, StyleSheet, View, useWindowDimensions} from 'react-native';
import Animated, {
    interpolateColor,
    useAnimatedStyle,
    useDerivedValue,
} from 'react-native-reanimated';

import {
    SAVE_COLOR,
    BUY_COLOR,
    DELETE_COLOR,
    ACTION_BUTTON_SIZE,
    PALETTE,
} from '@/constants';
import {useAnimatedProductContext} from '@/context/animatedProduct';
import {useSharedSavedContext} from '@/context/saved';
import {Database} from '@/types/schema';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    onPress?: () => void;
    disabled: boolean;
    product: Database['public']['Views']['v_products']['Row'];
};

const SCALE_AMOUNT = 0.9;

const BOX_SHADOW_START = 0.5;
const BOX_SHADOW_END = 0.4;
const BORDER_WIDTH = 4;

const ActionButton: React.FC<ActionButtonProps> = ({
    type,
    onPress,
    disabled,
    product,
}) => {
    const {width, height} = useWindowDimensions();
    const {
        buyPing,
        savePing,
        deletePing,
        actionJs,
        animateRight,
        animateLeft,
        animateUp,
        reset,
    } = useAnimatedProductContext();
    const {saveProduct} = useSharedSavedContext();

    const pingValue = useDerivedValue(() => {
        if (type === 'buy') {
            return buyPing.value;
        } else if (type === 'save') {
            return savePing.value;
        } else {
            return deletePing.value;
        }
    });

    const activeColor = useMemo(() => {
        if (type === 'save') {
            return SAVE_COLOR;
        } else if (type === 'buy') {
            return BUY_COLOR;
        } else {
            return DELETE_COLOR;
        }
    }, [type]);

    const rStyle = useAnimatedStyle(() => {
        const backgroundColor = interpolateColor(
            pingValue.value,
            [0, 1],
            ['#FFF', activeColor],
        );

        const borderColor = interpolateColor(
            pingValue.value,
            [0, 1],
            [PALETTE.neutral[0], activeColor],
        );

        return {
            transform: [
                {
                    // Goes from 1 to SCALE_AMOUNT based on progress
                    scale: 1 - (1 - SCALE_AMOUNT) * pingValue.value,
                },
            ],
            // Goes from 0.5 to 0.4 based on progress
            shadowOpacity:
                BOX_SHADOW_START - (1 - BOX_SHADOW_END) * pingValue.value,
            elevation: 5 - pingValue.value * 5,
            borderColor,
            backgroundColor,
        };
    });

    const icon = useMemo(() => {
        if (type === 'save') {
            return (
                <Ionicons
                    name="heart"
                    color={actionJs === type ? PALETTE.neutral[1] : activeColor}
                    size={ACTION_BUTTON_SIZE / 2.5}
                />
            );
        } else if (type === 'buy') {
            return (
                <MaterialCommunityIcons
                    name="cart"
                    size={ACTION_BUTTON_SIZE / 2}
                    color={actionJs === type ? PALETTE.neutral[1] : activeColor}
                />
            );
        } else {
            return (
                <Octicons
                    name="x"
                    size={ACTION_BUTTON_SIZE / 2}
                    color={actionJs === type ? PALETTE.neutral[1] : activeColor}
                />
            );
        }
    }, [type, actionJs, activeColor]);

    const press = async () => {
        Haptics.impactAsync();

        // If on press we're in product view.
        if (onPress) {
            onPress();
            return;
        }

        if (type === 'save') {
            animateRight(width * 0.75, true, () => {
                saveProduct(product);
            });

            return;
        }

        if (type === 'delete') {
            animateLeft(width * 0.75, true, () => {
                console.log('LEFT');
            });

            return;
        }

        if (type === 'buy') {
            animateUp(height * 0.25);
            await WebBrowser.openBrowserAsync(product.link);
            reset(true);
        }
    };

    return (
        <Animated.View style={[styles.buttonContainer, rStyle]}>
            <Pressable onPress={press} disabled={disabled}>
                <View style={[styles.button]}>{icon}</View>
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
