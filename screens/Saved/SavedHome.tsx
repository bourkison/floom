import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, ActivityIndicator} from 'react-native';

import {SavedStackParamList} from '@/nav/SavedNavigator';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';
import SearchInput from '@/components/Utility/SearchInput';

type CollectionType = {
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
        <View>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            {!isLoading ? (
                saves.map(save => <Text key={save.id}>{save.name}</Text>)
            ) : (
                <ActivityIndicator />
            )}
            <Text>Saved Home</Text>
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
});

export default SavedHome;
