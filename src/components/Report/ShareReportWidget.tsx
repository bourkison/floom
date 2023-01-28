import React, {useEffect, useState} from 'react';
import {
    View,
    TouchableOpacity,
    Text,
    StyleSheet,
    Share,
    Modal,
    SafeAreaView,
    ScrollView,
} from 'react-native';
import {PALETTE} from '@/constants';
import {Ionicons} from '@expo/vector-icons';
import {Product} from '@/types/product';
import CreateReport from '@/components/Report/CreateReport';

type ShareReportWidgetProps = {
    product: Product;
};

const ShareReportWidget: React.FC<ShareReportWidgetProps> = ({product}) => {
    const [modalVisible, setModalVisible] = useState(false);
    const [reportCreated, setReportCreated] = useState(false);

    const share = () => {
        Share.share({title: product.name, url: product.link});
    };

    const onReportCreate = () => {
        setReportCreated(true);
        setModalVisible(false);
    };

    useEffect(() => {
        setReportCreated(false);
    }, [product]);

    return (
        <View style={styles.container}>
            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    disabled={reportCreated}
                    style={styles.reportButton}
                    onPress={() => setModalVisible(true)}>
                    <Text style={styles.reportButtonText}>Report</Text>
                    <Ionicons name="warning" color={PALETTE.red[7]} />
                </TouchableOpacity>
                <TouchableOpacity style={styles.shareButton} onPress={share}>
                    <Text style={styles.shareButtonText}>Share</Text>
                    <Ionicons name="share" color={PALETTE.neutral[1]} />
                </TouchableOpacity>
            </View>
            {reportCreated ? (
                <View style={styles.reportCreatedContainer}>
                    <Text style={styles.reportCreatedText}>
                        Your report has been created and will be reviewed
                        shortly. Thank you for your help in keeping Floom
                        appropriate and relevant.
                    </Text>
                </View>
            ) : undefined}
            <Modal visible={modalVisible} animationType="slide">
                <SafeAreaView style={styles.flexOne}>
                    <ScrollView style={styles.flexOne}>
                        <View style={styles.headerContainer}>
                            <View style={styles.flexOne}>
                                <Text style={styles.headerText}>
                                    Report Product
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.cancelButton}
                                onPress={() => setModalVisible(false)}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>
                        </View>
                        <CreateReport
                            product={product}
                            onSubmit={onReportCreate}
                        />
                    </ScrollView>
                </SafeAreaView>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 30,
        flex: 1,
    },
    buttonsContainer: {
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
    flexOne: {flex: 1},
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 25,
    },
    headerText: {
        fontSize: 18,
        fontWeight: 'bold',
        paddingHorizontal: 10,
    },
    cancelButton: {paddingHorizontal: 5},
    reportCreatedContainer: {
        paddingHorizontal: 5,
        paddingVertical: 10,
        backgroundColor: PALETTE.red[2],
        borderColor: PALETTE.red[8],
        borderWidth: 1,
        marginTop: 10,
        borderRadius: 2,
    },
    reportCreatedText: {color: PALETTE.red[8], textAlign: 'center'},
});

export default ShareReportWidget;
