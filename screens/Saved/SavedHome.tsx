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
    const [isLoading, setIsLoading] = useState(false);
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
            setIsLoading(true);

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .order('created_at', {ascending: false});

            setIsLoading(false);

            if (error) {
                // TODO: Handle error.
                console.error(error);
                return;
            }

            const tempCollections: CollectionType[] = [];
            const tempSaves: Database['public']['Views']['v_saves']['Row'][] =
                [];

            // Loop through the response, and push to either the relevant collection,
            // or to the saves array (if no collection associated).
            data.forEach(save => {
                if (
                    save.collection_id !== null &&
                    save.collection_name !== null
                ) {
                    const collId = save.collection_id;
                    const collName = save.collection_name;

                    // First check to see if the collection has already been added.
                    let collectionIndex = tempCollections.findIndex(
                        collection => (collection.id = collId),
                    );

                    // If not, add it.
                    if (collectionIndex < 0) {
                        tempCollections.push({
                            name: collName,
                            id: collId,
                            products: [],
                        });
                        collectionIndex = tempCollections.length - 1;
                    }

                    // Finally, add this save in.
                    tempCollections[collectionIndex].products.push(save);

                    return;
                }

                tempSaves.push(save);
            });

            setCollections(tempCollections);
            setSaves(tempSaves);

            console.log('COLLECTIONS:', tempCollections);
            console.log('SAVES:', tempSaves);
        };

        fetchSaves();
    }, []);

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
                        headerText="Saves"
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
