import React, {useEffect, useState} from 'react';
import {View, StyleSheet, Text, LayoutAnimation, ViewStyle} from 'react-native';
import {PALETTE} from '@/constants';

type FeedbackProps = {
    type: 'success' | 'error' | 'warning';
    message: string;
    displayTime: number;
    visible: boolean;
    onFinish: () => void;
    containerStyle?: ViewStyle;
};

const Feedback: React.FC<FeedbackProps> = ({
    message,
    visible,
    onFinish,
    displayTime,
    type,
    containerStyle,
}) => {
    const [removeTimeout, setRemoveTimeout] = useState<
        NodeJS.Timer | undefined
    >();

    useEffect(() => {
        if (visible && !removeTimeout) {
            LayoutAnimation.configureNext({
                duration: 250,
                create: {
                    duration: 250,
                    type: LayoutAnimation.Types.easeInEaseOut,
                    property: LayoutAnimation.Properties.opacity,
                },
            });

            clearTimeout(removeTimeout);
            setRemoveTimeout(
                setTimeout(() => {
                    LayoutAnimation.configureNext({
                        duration: 150,
                        delete: {
                            duration: 150,
                            type: LayoutAnimation.Types.easeInEaseOut,
                            property: LayoutAnimation.Properties.opacity,
                        },
                    });

                    onFinish();
                }, displayTime),
            );

            return;
        } else if (!visible && removeTimeout) {
            clearTimeout(removeTimeout);
            setRemoveTimeout(undefined);
        }
    }, [visible, removeTimeout, onFinish, displayTime]);

    useEffect(() => {
        return () => clearTimeout(removeTimeout);
    }, [removeTimeout]);

    if (visible && message && type === 'success') {
        return (
            <View style={containerStyle}>
                <View style={styles.successContainer}>
                    <Text style={styles.successMessage}>{message}</Text>
                </View>
            </View>
        );
    } else if (visible && message && type === 'error') {
        return (
            <View style={containerStyle}>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorMessage}>{message}</Text>
                </View>
            </View>
        );
    }

    return <View />;
};

const styles = StyleSheet.create({
    successContainer: {
        backgroundColor: PALETTE.green[1],
        borderRadius: 5,
        borderColor: PALETTE.green[2],
        borderWidth: 1,
    },
    successMessage: {
        color: PALETTE.green[7],
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    errorContainer: {
        backgroundColor: PALETTE.red[1],
        borderRadius: 5,
        borderColor: PALETTE.red[2],
        borderWidth: 1,
    },
    errorMessage: {
        color: PALETTE.red[7],
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
});

export default Feedback;
