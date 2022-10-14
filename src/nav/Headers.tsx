import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Constants from 'expo-constants';
import {StackHeaderProps} from '@react-navigation/stack';
import {Entypo, Ionicons, Feather} from '@expo/vector-icons';

export const HomeHeader: React.FC<StackHeaderProps> = ({navigation}) => {
    return (
        <View
            style={[
                styles.headerContainer,
                {
                    flexBasis:
                        Constants.statusBarHeight + styles.headerRow.flexBasis,
                },
            ]}>
            <View
                style={{
                    flex: 1,
                    flexBasis: Constants.statusBarHeight,
                    flexGrow: 0,
                    flexShrink: 0,
                }}
            />
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => {
                        navigation.navigate('Options');
                    }}
                    style={styles.headerIcon}>
                    <Entypo name="cog" size={24} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Teender</Text>
                </View>
                <Pressable
                    onPress={() => {
                        navigation.navigate('LikedProducts');
                    }}
                    style={styles.headerIcon}>
                    <Ionicons name="heart-outline" size={24} />
                </Pressable>
            </View>
        </View>
    );
};

export const OptionsHeader: React.FC<StackHeaderProps> = ({navigation}) => {
    return (
        <View
            style={[
                styles.headerContainer,
                {
                    flexBasis:
                        Constants.statusBarHeight + styles.headerRow.flexBasis,
                },
            ]}>
            <View
                style={{
                    flex: 1,
                    flexBasis: Constants.statusBarHeight,
                    flexGrow: 0,
                    flexShrink: 0,
                }}
            />
            <View style={styles.headerRow}>
                <View style={styles.headerIcon} />
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Options</Text>
                </View>
                <Pressable
                    onPress={() => {
                        navigation.navigate('Home');
                    }}
                    style={styles.headerIcon}>
                    <Feather name="chevron-right" size={24} />
                </Pressable>
            </View>
        </View>
    );
};

export const LikedProductsHeader: React.FC<StackHeaderProps> = ({
    navigation,
}) => {
    return (
        <View
            style={[
                styles.headerContainer,
                {
                    flexBasis:
                        Constants.statusBarHeight + styles.headerRow.flexBasis,
                },
            ]}>
            <View
                style={{
                    flex: 1,
                    flexBasis: Constants.statusBarHeight,
                    flexGrow: 0,
                    flexShrink: 0,
                }}
            />
            <View style={styles.headerRow}>
                <Pressable
                    onPress={() => {
                        navigation.navigate('Home');
                    }}
                    style={styles.headerIcon}>
                    <Feather name="chevron-left" size={24} />
                </Pressable>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>Liked Products</Text>
                </View>
                <View style={styles.headerIcon} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 5,
        paddingHorizontal: 14,
    },
    headerRow: {
        flexBasis: 44,
        flexGrow: 0,
        flexShrink: 0,
        width: '100%',
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    headerIcon: {
        flexBasis: 24,
        flexGrow: 0,
        flexShrink: 0,
        flex: 1,
    },
});
