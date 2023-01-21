import React from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps,
    StyleSheet,
} from 'react-native';
import {PALETTE} from '@/constants';

const TextInput: React.FC<TextInputProps> = props => {
    return <RNTextInput {...props} style={[styles.textInput, props.style]} />;
};

const styles = StyleSheet.create({
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
});

export default TextInput;
