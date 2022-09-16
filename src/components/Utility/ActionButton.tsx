import React from 'react';
import Animated, {
    runOnJS,
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {View, StyleSheet, ViewStyle, Text} from 'react-native';
import {useAppDispatch} from '@/store/hooks';
import {COMMENCE_SAVE_TOP_PRODUCT} from '@/store/slices/product';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    radius: number;
    style?: ViewStyle;
};

const PRESSED_SCALE = 0.97;

const ActionButton: React.FC<ActionButtonProps> = ({type, radius, style}) => {
    const scale = useSharedValue(1);
    const dispatch = useAppDispatch();

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    });

    const actionPress = () => {
        dispatch(COMMENCE_SAVE_TOP_PRODUCT());
    };

    const touchGesture = Gesture.Tap()
        .maxDuration(250)
        .onTouchesDown(() => {
            scale.value = withTiming(PRESSED_SCALE, {
                duration: 100,
            });
        })
        .onTouchesUp(() => {
            runOnJS(actionPress)();
        })
        .onFinalize(() => {
            scale.value = withTiming(1, {
                duration: 100,
            });
        });

    return (
        <Animated.View
            style={[
                styles.buttonContainer,
                {
                    width: radius,
                    height: radius,
                    borderRadius: radius / 2,
                },
                style,
                rStyle,
            ]}>
            <GestureDetector gesture={touchGesture}>
                <View style={{flex: 1}}>
                    <Text>Save</Text>
                </View>
            </GestureDetector>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
        backgroundColor: '#f3fcf0',
    },
});

export default ActionButton;
