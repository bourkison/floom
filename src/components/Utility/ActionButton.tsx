import React from 'react';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withTiming,
} from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {View, StyleSheet, ViewStyle, Text} from 'react-native';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    radius: number;
    style?: ViewStyle;
    onPress: (type: 'save' | 'buy' | 'delete') => void;
};

const PRESSED_SCALE = 0.97;

const ActionButton: React.FC<ActionButtonProps> = ({type, radius, style}) => {
    const scale = useSharedValue(1);

    const rStyle = useAnimatedStyle(() => {
        return {
            transform: [
                {
                    scale: scale.value,
                },
            ],
        };
    });

    const touchGesture = Gesture.Tap()
        .maxDuration(250)
        .onTouchesDown(() => {
            scale.value = withTiming(PRESSED_SCALE, {
                duration: 100,
            });
        })
        .onTouchesUp(() => {
            console.log('TOUCH UP');
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
