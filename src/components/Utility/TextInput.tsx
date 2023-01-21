import React from 'react';
import {
    TextInput as RNTextInput,
    TextInputProps,
    StyleSheet,
} from 'react-native';
import {PALETTE} from '@/constants';

interface TIProps extends TextInputProps {
    bottomBorder: boolean;
}

const TextInput: React.FC<TIProps> = props => {
    return (
        <RNTextInput
            {...props}
            style={[
                styles.textInput,
                props.style,
                // eslint-disable-next-line react-native/no-inline-styles
                props.bottomBorder ? {borderBottomWidth: 1} : undefined,
            ]}
        />
    );
};

const styles = StyleSheet.create({
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
    },
});

export default TextInput;
