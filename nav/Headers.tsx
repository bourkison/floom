import {Entypo, Ionicons, Feather} from '@expo/vector-icons';
import {StackHeaderProps} from '@react-navigation/stack';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TouchableOpacity,
    TextInput,
} from 'react-native';

import {PALETTE} from '@/constants';
import {useAppDispatch, useAppSelector} from '@/store/hooks';
import {loadUnsavedProducts, updateSearchFilter} from '@/store/slices/product';

type HeaderProps = {
    children: string | JSX.Element;
    leftIcon?: JSX.Element;
    rightIcon?: JSX.Element;
};

export const HEADER_HEIGHT = 44;
export const HEADER_HEIGHT_W_STATUS_BAR =
    HEADER_HEIGHT + Constants.statusBarHeight;

const HeaderTemplate: React.FC<HeaderProps> = ({
    children,
    leftIcon,
    rightIcon,
}) => (
    <View
        style={[
            styles.headerContainer,
            {
                flexBasis: HEADER_HEIGHT_W_STATUS_BAR,
            },
        ]}>
        <View style={styles.statusBarEmpty} />
        <View style={styles.headerRow}>
            {leftIcon || <View style={styles.headerIcon} />}
            <View style={styles.headerTitleContainer}>
                {typeof children === 'string' ? (
                    <Text style={styles.headerTitle}>{children}</Text>
                ) : (
                    children
                )}
            </View>
            {rightIcon || <View style={styles.headerIcon} />}
        </View>
    </View>
);

export const HomeHeader: React.FC<StackHeaderProps> = ({navigation}) => {
    const dispatch = useAppDispatch();
    const searchText = useAppSelector(
        state => state.product.unsaved.filters.searchText,
    );

    const updateSearchText = (val: string) => {
        dispatch(updateSearchFilter({obj: 'unsaved', pl: val}));
    };

    const search = () => {
        Haptics.impactAsync();

        dispatch(loadUnsavedProducts());
    };

    return (
        <HeaderTemplate
            leftIcon={
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('Options');
                    }}
                    style={styles.headerIcon}>
                    <Entypo name="cog" size={24} />
                </TouchableOpacity>
            }
            rightIcon={
                <TouchableOpacity
                    onPress={() => {
                        navigation.navigate('SavedProducts');
                    }}
                    style={styles.headerIcon}>
                    <Ionicons name="heart-outline" size={24} />
                </TouchableOpacity>
            }>
            <View style={styles.searchContainer}>
                <View style={styles.searchSection}>
                    <Ionicons
                        name="search"
                        style={styles.searchIcon}
                        color={PALETTE.neutral[0]}
                    />

                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search"
                        placeholderTextColor={PALETTE.neutral[3]}
                        onChangeText={updateSearchText}
                        onSubmitEditing={search}
                        value={searchText}
                        returnKeyType="search"
                        selectTextOnFocus={true}
                    />

                    {searchText.length > 0 && (
                        <Pressable
                            onPress={() => {
                                updateSearchText('');
                            }}>
                            <Feather
                                name="x-circle"
                                style={styles.searchIcon}
                                color={PALETTE.neutral[0]}
                                size={14}
                            />
                        </Pressable>
                    )}
                </View>
            </View>
        </HeaderTemplate>
    );
};

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

export const UpdateDetailHeader: React.FC<StackHeaderProps> = ({
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
        Account Details
    </HeaderTemplate>
);

export const LoginHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('HomeAuth');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        Login
    </HeaderTemplate>
);

export const SignUpHeader: React.FC<StackHeaderProps> = ({navigation}) => (
    <HeaderTemplate
        leftIcon={
            <Pressable
                onPress={() => {
                    navigation.navigate('HomeAuth');
                }}
                style={styles.headerIcon}>
                <Feather name="chevron-left" size={24} />
            </Pressable>
        }>
        Sign Up
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
        zIndex: 999,
        elevation: 99,
    },
    headerRow: {
        flexBasis: HEADER_HEIGHT,
        flexGrow: 0,
        flexShrink: 0,
        width: '100%',
        alignSelf: 'stretch',
        flexDirection: 'row',
        alignContent: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        elevation: 99,
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
    logoText: {
        fontSize: 20,
        color: PALETTE.neutral[9],
        textAlign: 'center',
        fontFamily: 'JosefinSans-Regular',
        textTransform: 'lowercase',
    },
    searchContainer: {
        paddingVertical: 3,
        paddingHorizontal: 10,
        width: '100%',
        flex: 1,
    },
    searchSection: {
        backgroundColor: PALETTE.neutral[5],
        borderRadius: 5,
        marginVertical: 5,
        width: '100%',
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    searchInput: {
        color: PALETTE.neutral[0],
        fontSize: 14,
        alignSelf: 'center',
        paddingVertical: 5,
        flex: 1,
    },
    searchIcon: {
        paddingHorizontal: 5,
    },
});
