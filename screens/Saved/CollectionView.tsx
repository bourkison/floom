import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useLayoutEffect, useMemo, useState} from 'react';
import {View, StyleSheet, ScrollView, ActivityIndicator} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';

import SaveListItem from '@/components/Save/SaveListItem';
import SearchInput from '@/components/Utility/SearchInput';
import {useSharedSavedContext} from '@/context/saved';
import {SavedStackParamList} from '@/nav/SavedNavigator';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';

const CollectionView = ({
    route,
}: StackScreenProps<SavedStackParamList, 'CollectionView'>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [products, setProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);
    const animationsEnabled = useSharedValue(false);

    useLayoutEffect(() => {
        animationsEnabled.value = true;
    });

    const {collections} = useSharedSavedContext();

    useEffect(() => {
        const fetchCollectionProducts = async () => {
            setIsLoading(true);

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .eq('collection_id', route.params.collectionId)
                .order('updated_at', {ascending: false});

            if (error) {
                // TODO: Handle error
                console.error(error);
                return;
            }

            setProducts(data);
            setIsLoading(false);
        };

        fetchCollectionProducts();
    }, [collections, route]);

    const filteredProducts = useMemo(() => {
        return products.filter(product => product.name.includes(searchText));
    }, [products, searchText]);

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <SearchInput
                    value={searchText}
                    onChangeText={setSearchText}
                    onClearPress={() => setSearchText('')}
                />
            </View>

            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <ScrollView
                    style={styles.scrollContainer}
                    showsVerticalScrollIndicator={false}>
                    {filteredProducts.map(product => (
                        <SaveListItem
                            animationsEnabled={animationsEnabled}
                            save={product}
                            key={product.id}
                            selectable={false}
                            onSelect={() => {}}
                            selectedProducts={[]}
                        />
                    ))}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
    },
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
        width: '100%',
    },
});

export default CollectionView;
