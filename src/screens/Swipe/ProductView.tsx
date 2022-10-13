import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import FontAwesome from '@expo/vector-icons/FontAwesome5';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    return (
        <View>
            <View style={styles.header}>
                <View style={styles.headerColumn}></View>
                <View style={styles.headerColumn}>
                    <Text style={styles.headerText}>
                        {route.params.product.title}
                    </Text>
                </View>
                <View style={styles.headerColumn}>
                    <Pressable
                        onPress={() => {
                            navigation.pop();
                        }}>
                        <FontAwesome
                            name="chevron-down"
                            size={14}
                            style={styles.chevronDown}
                        />
                    </Pressable>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        paddingVertical: 14,
        shadowColor: '#343E4B',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        width: '100%',
        backgroundColor: '#ffffff',
        flexDirection: 'row',
    },
    headerColumn: {
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center',
    },
    headerText: {
        fontSize: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
    chevronDown: {
        marginRight: 18,
        marginTop: 2,
        alignSelf: 'flex-end',
    },
});

export default ProductView;
