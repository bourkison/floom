import {StackScreenProps} from '@react-navigation/stack';
import React from 'react';
import {
    ScrollView,
    Text,
    StyleSheet,
    TouchableHighlight,
    View,
} from 'react-native';

import {PALETTE} from '@/constants';
import {FiltersStackParamList} from '@/nav/FiltersNavigator';

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const FiltersHome = ({
    navigation,
}: StackScreenProps<FiltersStackParamList, 'FiltersHome'>) => {
    return (
        <ScrollView style={styles.container}>
            <View style={styles.listContainer}>
                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Brand')}
                    style={styles.touchable}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Brand
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>All</Text>
                        </View>
                    </View>
                </TouchableHighlight>

                <TouchableHighlight
                    underlayColor={TOUCHABLE_UNDERLAY}
                    activeOpacity={TOUCHABLE_ACTIVE_OPACITY}
                    onPress={() => navigation.navigate('Brand')}
                    style={[styles.touchable, styles.noBorder]}>
                    <View style={styles.touchableContentContainer}>
                        <View>
                            <Text style={[styles.text, styles.title]}>
                                Colors
                            </Text>
                        </View>
                        <View>
                            <Text style={styles.text}>All</Text>
                        </View>
                    </View>
                </TouchableHighlight>
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingVertical: 25,
    },
    listContainer: {
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowOffset: {
            width: 0,
            height: 0,
        },
    },
    touchable: {},
    touchableContentContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        backgroundColor: '#FFF',
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    noBorder: {
        borderColor: 'transparent',
    },
    text: {
        fontSize: 16,
        fontWeight: '300',
    },
    title: {
        fontWeight: '500',
    },
});

export default FiltersHome;
