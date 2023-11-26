import {Feather} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import SelectableSaveListItem from '@/components/Save/SelectableSaveListItem';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {SavedStackParamList} from '@/nav/SavedNavigator';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';

const CollectionNew = ({
    navigation,
}: StackScreenProps<SavedStackParamList, 'CollectionNew'>) => {
    const [isCreating, setIsCreating] = useState(false);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    const [name, setName] = useState('');
    const [products, setProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);
    const [selectedProducts, setSelectedProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const {bottom} = useSafeAreaInsets();

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoadingProducts(true);

            const {data, error} = await supabase
                .from('v_saves')
                .select()
                .order('created_at', {ascending: false})
                .is('collection_id', null);

            setIsLoadingProducts(false);

            if (error) {
                // TODO: Handle error
                console.error(error);
                return;
            }

            setProducts(data);
        };

        fetchProducts();
    }, []);

    const createCollection = async () => {
        setIsCreating(true);

        // First create the collection.
        const {data: collData, error: collError} = await supabase
            .from('collections')
            .insert({name})
            .select()
            .limit(1)
            .single();

        if (collError) {
            // TODO: Handle error
            console.error('coll error', collError);
            setIsCreating(false);
            return;
        }

        if (!selectedProducts.length) {
            setIsCreating(false);
            return;
        }

        const {error: saveError} = await supabase
            .from('saves')
            .update({collection_id: collData.id})
            .in(
                'id',
                selectedProducts.map(save => save.id),
            );

        setIsCreating(false);

        if (saveError) {
            console.error('save error', saveError);
            return;
        }

        navigation.goBack();
    };

    const productSelected = (
        selected: Database['public']['Views']['v_saves']['Row'],
    ) => {
        const findIndex = selectedProducts.findIndex(
            product => selected.product_id === product.product_id,
        );

        if (findIndex < 0) {
            setSelectedProducts([...selectedProducts, selected]);
            return;
        }

        setSelectedProducts([
            ...selectedProducts.slice(0, findIndex),
            ...selectedProducts.slice(findIndex + 1),
        ]);
    };

    const isProductSelected = (
        product: Database['public']['Views']['v_saves']['Row'],
    ): boolean => {
        const findIndex = selectedProducts.findIndex(
            p => product.product_id === p.product_id,
        );

        if (findIndex < 0) {
            return false;
        }

        return true;
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <View style={styles.headerColumn} />

                <View style={styles.headerTextContainer}>
                    <Text style={styles.headerText}>New Collection</Text>
                </View>

                <Pressable
                    style={styles.headerColumn}
                    onPress={() => navigation.goBack()}>
                    <Feather name="x" size={24} />
                </Pressable>
            </View>

            <ScrollView
                style={styles.contentContainer}
                keyboardShouldPersistTaps={false}
                keyboardDismissMode="on-drag">
                <View style={styles.collectionInputContainer}>
                    <Text style={styles.titleText}>Collection Name</Text>

                    <TextInput
                        onChangeText={setName}
                        style={styles.textInput}
                        value={name}
                        returnKeyType="default"
                    />

                    <Text style={styles.hintText}>
                        Collections are a great way to organise products you
                        want, and to build out mood boards!
                    </Text>
                </View>

                <View style={styles.savedProductsSection}>
                    <Text style={[styles.titleText, styles.addProductText]}>
                        Add Products (optional)
                    </Text>

                    {isLoadingProducts ? (
                        <ActivityIndicator style={styles.activityIndicator} />
                    ) : (
                        <View style={styles.savedProductsContainer}>
                            {products.map(product => (
                                <SelectableSaveListItem
                                    key={product.id}
                                    save={product}
                                    onSelect={productSelected}
                                    selected={isProductSelected(product)}
                                />
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <View
                style={[styles.createButtonContainer, {paddingBottom: bottom}]}>
                <AnimatedButton
                    style={styles.createButton}
                    textStyle={styles.createButtonText}
                    onPress={createCollection}
                    disabled={isCreating}>
                    {isCreating ? (
                        <ActivityIndicator size={14} />
                    ) : (
                        'Create Collection'
                    )}
                </AnimatedButton>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '100%',
        paddingHorizontal: 14,
        paddingVertical: 16,
        backgroundColor: '#FFF',
        borderBottomWidth: 1,
        borderBottomColor: PALETTE.neutral[2],
    },
    headerColumn: {
        flex: 1,
        flexBasis: 24,
        flexGrow: 0,
        flexShrink: 0,
    },
    headerTextContainer: {},
    headerText: {
        fontSize: 18,
        fontWeight: '500',
        textAlign: 'center',
    },
    contentContainer: {
        paddingTop: 10,
    },
    collectionInputContainer: {
        paddingHorizontal: 25,
    },
    titleText: {
        fontSize: 12,
        fontWeight: '500',
    },
    addProductText: {
        paddingHorizontal: 25,
        marginBottom: 10,
    },
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderColor: PALETTE.neutral[9],
        borderBottomWidth: 3,
        marginTop: 10,
    },
    hintText: {
        fontSize: 12,
        color: PALETTE.neutral[5],
        fontWeight: '300',
        marginTop: 10,
    },
    savedProductsSection: {
        marginTop: 30,
    },
    savedProductsContainer: {
        borderTopWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    activityIndicator: {
        marginTop: 10,
    },
    createButtonContainer: {
        position: 'absolute',
        bottom: 10,
        paddingHorizontal: 25,
        width: '100%',
    },
    createButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginLeft: 10,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.3,
    },
    createButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default CollectionNew;
