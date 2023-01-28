import React from 'react';
import {View, TouchableOpacity, Text, StyleSheet} from 'react-native';
import {PALETTE} from '@/constants';
import {Ionicons} from '@expo/vector-icons';

const ShareReportWidget = () => {
    return (
        <View style={styles.container}>
            <TouchableOpacity style={styles.reportButton}>
                <Text style={styles.reportButtonText}>Report</Text>
                <Ionicons name="warning" color={PALETTE.red[7]} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
                <Text style={styles.shareButtonText}>Share</Text>
                <Ionicons name="share" color={PALETTE.neutral[1]} />
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
        flexDirection: 'row',
        flex: 1,
    },
    reportButton: {
        borderColor: PALETTE.red[7],
        borderWidth: 2,
        backgroundColor: PALETTE.neutral[1],
        flex: 1,
        paddingVertical: 5,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 2,
        marginHorizontal: 5,
    },
    reportButtonText: {
        marginRight: 5,
        textTransform: 'uppercase',
        color: PALETTE.red[7],
        fontWeight: 'bold',
    },
    shareButton: {
        borderColor: PALETTE.neutral[8],
        borderWidth: 2,
        backgroundColor: PALETTE.neutral[8],
        flex: 2,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'row',
        borderRadius: 2,
        marginHorizontal: 5,
    },
    shareButtonText: {
        marginRight: 5,
        textTransform: 'uppercase',
        color: PALETTE.neutral[1],
        fontWeight: 'bold',
    },
});

export default ShareReportWidget;
