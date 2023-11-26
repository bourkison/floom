import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useMemo, useState} from 'react';
import {View, StyleSheet, ActivityIndicator, ScrollView} from 'react-native';

import CollapsibleSection from '@/components/Save/CollapsibleSection';
import CollectionListItem from '@/components/Save/CollectionListItem';
import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {SavedStackParamList} from '@/nav/SavedNavigator';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';

export type CollectionType = {
    name: string;
    id: number;
    products: Database['public']['Views']['v_saves']['Row'][];
};

const SavedHome = (_: StackScreenProps<SavedStackParamList, 'SavedHome'>) => {
    const [isLoadingSaves, setIsLoadingSaves] = useState(false);
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const [searchText, setSearchText] = useState('');

    const [collections, setCollections] = useState<CollectionType[]>([]);
    // Saves are saves that do not have a collection.
    const [saves, setSaves] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const [collectionsExpanded, setCollectionsExpanded] = useState(true);
    const [savesExpanded, setSavesExpanded] = useState(true);

    const filteredCollections = useMemo(() => {
        return collections.filter(collection =>
            collection.name.includes(searchText),
        );
    }, [collections, searchText]);

    const filteredSaves = useMemo(() => {
        return saves.filter(save => save.name.includes(searchText));
    }, [saves, searchText]);

    useEffect(() => {
        const fetchSaves = async () => {
            setIsLoadingSaves(true);

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .is('collection_id', null)
                .order('created_at', {ascending: false});

            setIsLoadingSaves(false);

            if (error) {
                // TODO: Handle error.
                console.error(error);
                return;
            }

            setSaves(data);
        };

        fetchSaves();
    }, []);

    useEffect(() => {
        const fetchCollections = async () => {
            setIsLoadingCollections(true);

            const {data: collData, error: collError} = await supabase
                .from('collections')
                .select()
                .order('created_at', {ascending: false});

            if (collError) {
                setIsLoadingCollections(false);
                console.error(collError);
                return;
            }

            const promises: Promise<CollectionType>[] = [];

            collData.forEach(collection => {
                promises.push(
                    new Promise(async (resolve, reject) => {
                        const {data: saveData, error: saveError} =
                            await supabase
                                .from('v_saves')
                                .select()
                                .eq('collection_id', collection.id)
                                .order('created_at', {ascending: false});

                        if (saveError) {
                            return reject(saveError);
                        }

                        resolve({
                            id: collection.id,
                            name: collection.name,
                            products: saveData,
                        });
                    }),
                );
            });

            const response = await Promise.allSettled(promises);
            const tempCollections: CollectionType[] = [];

            response.forEach(r => {
                if (r.status === 'rejected') {
                    console.error('SAVES ERROR:', r.reason);
                    return;
                }

                tempCollections.push(r.value);
            });

            setIsLoadingCollections(false);
            setCollections(tempCollections);
        };

        fetchCollections();
    }, []);

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
