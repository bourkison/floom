import React, {useState, useRef} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import {PALETTE, REPORT_TYPES} from '@/constants';
import {FontAwesome5} from '@expo/vector-icons';
import SectionHeader from '@/components/Utility/SectionHeader';
import SetReportType from '@/components/Report/SetReportType';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import Spinner from '@/components/Utility/Spinner';
import {Product} from '@/types/product';
import {createReport as createReportApi} from '@/api/report';

type CreateReportProps = {
    onSubmit?: () => void;
    product: Product;
};

const CreateReport: React.FC<CreateReportProps> = ({onSubmit, product}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [reportTypeModalVisible, setReportTypeModalVisible] = useState(false);

    const [type, setType] = useState<typeof REPORT_TYPES[number]['id']>();
    const [message, setMessage] = useState('');
    const SetReportTypeRef = useRef<TouchableOpacity>(null);

    const createReport = async () => {
        if (type) {
            setIsLoading(!isLoading);

            await createReportApi({
                productId: product._id,
                init: {body: {type, message}},
            });

            if (onSubmit) {
                onSubmit();
            }
        }
    };

    return (
        <View>
            <View>
                <SectionHeader>Category</SectionHeader>

                <TouchableOpacity
                    style={styles.typeSelectorTouchable}
                    ref={SetReportTypeRef}
                    onPress={() => setReportTypeModalVisible(true)}>
                    <View style={styles.flexOne}>
                        <Text>
                            {type && REPORT_TYPES.filter(t => t.id === type)[0]
                                ? REPORT_TYPES.filter(t => t.id === type)[0]
                                      .name
                                : 'Select a category...'}
                        </Text>
                    </View>
                    <View style={styles.caretIcon}>
                        {reportTypeModalVisible ? (
                            <FontAwesome5 name="caret-up" />
                        ) : (
                            <FontAwesome5 name="caret-down" />
                        )}
                    </View>
                </TouchableOpacity>
                <Text style={styles.hintText}>
                    Select a category above so we can easily track the issue.
                </Text>
                <SetReportType
                    visible={reportTypeModalVisible}
                    setVisible={setReportTypeModalVisible}
                    touchableRef={SetReportTypeRef}
                    selectedValue={type}
                    setSelectedValue={setType}
                />
            </View>
            <View style={styles.marginTop}>
                <SectionHeader>Note</SectionHeader>
                <TextInput
                    onChangeText={setMessage}
                    textAlignVertical="top"
                    multiline={true}
                    style={styles.messageInput}
                />
                {message.length ? (
                    <Text style={styles.hintText}>{message.length} / 1000</Text>
                ) : undefined}
                <Text style={styles.hintText}>
                    Add some information (up to 1000 characters) so we get a
                    better understanding of the issue.
                </Text>
            </View>
            <View style={styles.marginTop}>
                <View style={styles.buttonContainer}>
                    <AnimatedButton
                        onPress={createReport}
                        style={styles.createReportButton}
                        textStyle={styles.createReportButtonText}
                        disabled={isLoading}>
                        {isLoading ? (
                            <Spinner
                                diameter={14}
                                spinnerWidth={2}
                                backgroundColor="#1a1f25"
                                spinnerColor="#f3fcfa"
                            />
                        ) : (
                            'Submit'
                        )}
                    </AnimatedButton>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    typeSelectorTouchable: {
        paddingVertical: 10,
        paddingHorizontal: 5,
        borderColor: PALETTE.neutral[2],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        marginTop: 4,
        flexDirection: 'row',
        backgroundColor: '#FFF',
    },
    caretIcon: {paddingRight: 5},
    flexOne: {flex: 1},
    hintText: {
        color: PALETTE.gray[4],
        fontSize: 12,
        paddingHorizontal: 5,
        marginTop: 5,
    },
    messageInput: {
        minHeight: 128,
        width: '100%',
        paddingHorizontal: 5,
        backgroundColor: '#FFF',
        shadowColor: PALETTE.neutral[4],
        shadowOpacity: 0.5,
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    marginTop: {marginTop: 25},
    buttonContainer: {
        padding: 10,
    },
    createReportButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    createReportButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default CreateReport;
