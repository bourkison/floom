import {AntDesign, Feather} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {StyleSheet, Pressable, Text, TouchableOpacity} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import CollectionList from '@/components/Save/CollectionList';
import SavedList from '@/components/Save/SavedList';
import Tabs from '@/components/Utility/Tabs';
import {PALETTE} from '@/constants';
import {useSharedSavedContext} from '@/context/saved';
import {HeaderTemplate} from '@/nav/Headers';
import {SavedStackParamList} from '@/nav/types';

export const INITIAL_SAVE_LOAD_AMOUNT = 10;
export const SUBSEQUENT_SAVE_LOAD_AMOUNT = 10;

const SavedHome = ({
    navigation,
}: StackScreenProps<SavedStackParamList, 'SavedHome'>) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [savesSelectable, setSavesSelectable] = useState(false);
    const animationsEnabled = useSharedValue(false);
    // const [animationsEnabled, setAnimationsEnabled] = useState(false);

    const {
        fetchCollections,
        fetchSaves,
        hasInitiallyLoadedSaves,
        hasInitiallyLoadedCollections,
    } = useSharedSavedContext();

    useEffect(() => {
        if (!hasInitiallyLoadedCollections) {
            fetchCollections('initial');
        }

        if (!hasInitiallyLoadedSaves) {
            fetchSaves(INITIAL_SAVE_LOAD_AMOUNT, 'initial');
        }
    }, [
        fetchSaves,
        fetchCollections,
        hasInitiallyLoadedSaves,
        hasInitiallyLoadedCollections,
    ]);

    return (
        <>
            <HeaderTemplate
                style={styles.hiddenShadowWithBorder}
                leftIcon={
                    <Pressable
                        onPress={() => navigation.goBack()}
                        style={styles.headerIcon}>
                        <Feather name="chevron-left" size={24} />
                    </Pressable>
                }
                rightIcon={
                    activeTabIndex === 0 ? (
                        <TouchableOpacity
                            style={[styles.headerIcon, styles.rightIcon]}
                            onPress={() =>
                                setSavesSelectable(!savesSelectable)
                            }>
                            <Text>
                                {!savesSelectable ? 'Select' : 'Cancel'}
                            </Text>
                        </TouchableOpacity>
                    ) : (
                        <Pressable
                            onPress={() => navigation.navigate('CollectionNew')}
                            style={[styles.headerIcon, styles.rightIcon]}>
                            <AntDesign name="plus" size={24} />
                        </Pressable>
                    )
                }>
                Saved
            </HeaderTemplate>
            <Tabs
                onTabChange={toIndex => {
                    animationsEnabled.value = false;
                    setSavesSelectable(false);
                    setActiveTabIndex(toIndex);
                }}
                activeTabIndex={activeTabIndex}
                pages={[
                    {
                        header: 'Saved Items',
                        content: (
                            <SavedList
                                savesSelectable={savesSelectable}
                                setSavesSelectable={setSavesSelectable}
                                animationsEnabled={animationsEnabled}
                            />
                        ),
                    },
                    {
                        header: 'Collections',
                        content: <CollectionList />,
                    },
                ]}
            />
        </>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: PALETTE.neutral[1],
        paddingVertical: 10,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    headerText: {
        fontWeight: '400',
        fontSize: 14,
    },

    hiddenShadowWithBorder: {
        shadowOpacity: 0,
        borderBottomWidth: 1,
        borderBottomColor: PALETTE.neutral[2],
    },
    headerIcon: {
        flexBasis: 60,
        flexGrow: 0,
        flexShrink: 0,
        flex: 1,
        flexWrap: 'nowrap',
        overflow: 'visible',
    },
    rightIcon: {
        alignItems: 'flex-end',
    },
});

export default SavedHome;
