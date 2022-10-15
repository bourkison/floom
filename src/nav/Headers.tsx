import React from 'react';
import {View, Text, StyleSheet, Pressable} from 'react-native';
import Constants from 'expo-constants';
import {StackHeaderProps} from '@react-navigation/stack';
import {Entypo, Ionicons, Feather} from '@expo/vector-icons';

type HeaderProps = {
    children: string;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
};

const HeaderTemplate: React.FC<HeaderProps> = ({
    children,
    leftIcon,
    rightIcon,
}) => (
    <View
        style={[
            styles.headerContainer,
            {
                flexBasis:
                    Constants.statusBarHeight + styles.headerRow.flexBasis,
            },
        ]}>
        <View style={styles.statusBarEmpty} />
        <View style={styles.headerRow}>
            {leftIcon || <View style={styles.statusBarEmpty} />}
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>{children}</Text>
            </View>
            {rightIcon || <View style={styles.statusBarEmpty} />}
        </View>
    </View>
);

export const HomeHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('Options');
                }}
                style={styles.headerIcon}>
                <Entypo name="cog" size={24} />
            </Pressable>
        }
        rightIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('SavedProducts');
                }}
                style={styles.headerIcon}>
                <Ionicons name="heart-outline" size={24} />
            </Pressable>
        }>
        Teender
    </HeaderTemplate>
);

export const OptionsHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        rightIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('Home');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-right" size={24} />
            </Pressable>
        }>
        Options
    </HeaderTemplate>
);

export const SavedProductsHeader: React.FC<StackHeaderProps> = ({
    navigation,
}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('Home');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        Liked Products
    </HeaderTemplate>
);

export const DeletedProductsHeader: React.FC<StackHeaderProps> = ({
    navigation,
}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('OptionsHome');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        Deleted Products
    </HeaderTemplate>
);

export const AccountHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('OptionsHome');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        Account
    </HeaderTemplate>
);

export const AppInfoHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('OptionsHome');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        App Info
    </HeaderTemplate>
);

const styles = StyleSheet.create({
    headerContainer: {
        flex: 1,
        backgroundColor: '#fff',
        paddingBottom: 5,
        paddingHorizontal: 14,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -1,
            width: -1,
        },
        shadowOpacity: 0.3,
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
    statusBarEmpty: {
        flex: 1,
        flexBasis: Constants.statusBarHeight,
        flexGrow: 0,
        flexShrink: 0,
    },
});
