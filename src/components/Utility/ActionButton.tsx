import React from 'react';
// import Animated from 'react-native-reanimated';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import {View, StyleSheet, ViewStyle, Text} from 'react-native';

type ActionButtonProps = {
    type: 'save' | 'buy' | 'delete';
    radius: number;
    style?: ViewStyle;
};

const ActionButton: React.FC<ActionButtonProps> = ({type, radius, style}) => {
    const touchGesture = Gesture.Tap()
        .maxDuration(250)
        .onTouchesDown(e => {
            console.log(e.allTouches);
        });

    return (
        <View style={[styles.buttonContainer, {width: radius, height: radius}]}>
            <GestureDetector gesture={touchGesture}>
                <View>
                    <Text>Save</Text>
                </View>
            </GestureDetector>
        </View>
    );
};

const styles = StyleSheet.create({
    buttonContainer: {
        flex: 1,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
    },
});

export default ActionButton;
