import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, ActivityIndicator, ScrollView} from 'react-native';

import CollapsibleSection from '@/components/Save/CollapsibleSection';
import CollectionListItem from '@/components/Save/CollectionListItem';
import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {useSharedSavedContext} from '@/context/saved';
import {SavedStackParamList} from '@/nav/SavedNavigator';

const SavedHome = (_: StackScreenProps<SavedStackParamList, 'SavedHome'>) => {
    const [searchText, setSearchText] = useState('');

    const [collectionsExpanded, setCollectionsExpanded] = useState(true);
    const [savesExpanded, setSavesExpanded] = useState(true);

    const {
        initFetchCollections,
        initFetchSaves,
        collections,
        saves,
        isLoadingSaves,
        isLoadingCollections,
    } = useSharedSavedContext();

    const filteredCollections = useMemo(() => {
        return collections.filter(collection =>
            collection.name.includes(searchText),
        );
    }, [collections, searchText]);

    const filteredSaves = useMemo(() => {
        return saves.filter(save => save.name.includes(searchText));
    }, [saves, searchText]);

    useEffect(() => {
        initFetchCollections();
        initFetchSaves();
    }, [initFetchSaves, initFetchCollections]);

    const isLoading = useMemo<boolean>(() => {
        if (isLoadingSaves || isLoadingCollections) {
            return true;
        }

        return false;
    }, [isLoadingSaves, isLoadingCollections]);

    return (
        <View style={styles.scrollContainer}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            {!isLoading ? (
                <ScrollView
                    style={styles.scrollContainer}
                    keyboardDismissMode="on-drag"
                    showsVerticalScrollIndicator={false}>
                    <CollapsibleSection
                        headerText="Collections"
                        onHeaderPress={() =>
                            setCollectionsExpanded(!collectionsExpanded)
                        }
                        expanded={collectionsExpanded}>
                        {filteredCollections.map(collection => (
                            <CollectionListItem
                                collection={collection}
                                key={collection.id}
                            />
                        ))}
                    </CollapsibleSection>

                    <CollapsibleSection
                        showIcon={false}
                        disabled
                        headerText="Saved"
                        onHeaderPress={() => setSavesExpanded(!savesExpanded)}
                        expanded={savesExpanded}>
                        {filteredSaves.map(save => (
                            <SaveListItem save={save} key={save.id} />
                        ))}
                    </CollapsibleSection>
                </ScrollView>
            ) : (
                <ActivityIndicator />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    searchContainer: {
        paddingVertical: 5,
        paddingHorizontal: 10,
        width: '100%',
        flexBasis: 50,
        backgroundColor: '#FFF',
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: -1,
            width: -1,
        },
        shadowOpacity: 0.3,
    },
    scrollContainer: {
        flex: 1,
        width: '100%',
    },
});

export default SavedHome;
