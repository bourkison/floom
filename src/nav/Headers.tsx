import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import {StackHeaderProps} from '@react-navigation/stack';
import {Entypo, Ionicons, Feather} from '@expo/vector-icons';

export const HomeHeader: React.FC<StackHeaderProps> = ({route, navigation}) => {
    return (
        <View style={styles.headerContainer}>
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
    );
};

export const OptionsHeader: React.FC<StackHeaderProps> = ({
    route,
    navigation,
}) => {
    return (
        <View style={styles.headerContainer}>
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
    );
};

export const LikedProductsHeader: React.FC<StackHeaderProps> = ({
    route,
    navigation,
}) => {
    return (
        <View style={styles.headerContainer}>
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
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        backgroundColor: '#FFF',
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 5,
        flexBasis: 44,
        flexGrow: 0,
        flexShrink: 0,
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
        marginHorizontal: 14,
    },
});
