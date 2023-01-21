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
        flex: 1,
        color: PALETTE.neutral[8],
        borderColor: PALETTE.neutral[8],
        backgroundColor: '#f3fcfa',
        borderRadius: 5,
        borderWidth: 1,
        fontSize: 14,
        flexShrink: 0,
        flexGrow: 0,
        padding: 10,
    },
});

export default TextInput;
