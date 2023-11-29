import {Feather} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    TextInput,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import {useSharedValue} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import SaveListItem from '@/components/Save/SaveListItem';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {useSharedSavedContext} from '@/context/saved';
import {SavedStackParamList} from '@/nav/types';
import {
    INITIAL_SAVE_LOAD_AMOUNT,
    SUBSEQUENT_SAVE_LOAD_AMOUNT,
} from '@/screens/Saved/SavedHome';
import {Database} from '@/types/schema';

const CollectionNew = ({
    navigation,
}: StackScreenProps<SavedStackParamList, 'CollectionNew'>) => {
    const [isCreating, setIsCreating] = useState(false);

    const [name, setName] = useState('');
    const [selectedProducts, setSelectedProducts] = useState<
        Database['public']['Views']['v_saves']['Row'][]
    >([]);

    const animationsEnabled = useSharedValue(true);

    const {bottom} = useSafeAreaInsets();

    const {
        saves,
        hasInitiallyLoadedSaves,
        loadingSavesState,
        fetchSaves,
        createCollection,
    } = useSharedSavedContext();

    useEffect(() => {
        if (!hasInitiallyLoadedSaves) {
            fetchSaves(INITIAL_SAVE_LOAD_AMOUNT, 'initial');
        }
    }, [hasInitiallyLoadedSaves, fetchSaves]);

    const create = async () => {
        setIsCreating(true);

        await createCollection({name}, selectedProducts);

        setIsCreating(false);

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

            <FlatList
                keyboardDismissMode="on-drag"
                keyboardShouldPersistTaps="never"
                ListHeaderComponent={
                    <>
                        <View style={styles.collectionInputContainer}>
                            <Text style={styles.titleText}>
                                Collection Name
                            </Text>

                            <TextInput
                                onChangeText={setName}
                                style={styles.textInput}
                                value={name}
                                returnKeyType="default"
                            />

                            <Text style={styles.hintText}>
                                Collections are a great way to organise products
                                you want, and to build out mood boards!
                            </Text>
                        </View>
                        <Text style={[styles.titleText, styles.addProductText]}>
                            Add Products (optional)
                        </Text>
                    </>
                }
                ListEmptyComponent={
                    loadingSavesState === 'load' ? (
                        <ActivityIndicator style={styles.activityIndicator} />
                    ) : undefined
                }
                data={saves}
                keyExtractor={item => item.id.toString()}
                onEndReached={
                    loadingSavesState !== 'additional' &&
                    loadingSavesState !== 'complete'
                        ? () => {
                              fetchSaves(
                                  SUBSEQUENT_SAVE_LOAD_AMOUNT,
                                  'loadMore',
                              );
                          }
                        : undefined
                }
                renderItem={({item}) => (
                    <SaveListItem
                        animationsEnabled={animationsEnabled}
                        selectable
                        save={item}
                        onSelect={productSelected}
                        selectedProducts={selectedProducts}
                    />
                )}
                ListFooterComponent={
                    loadingSavesState === 'additional' ? (
                        <ActivityIndicator
                            style={styles.loadingMoreIndicator}
                        />
                    ) : undefined
                }
            />

            <View
                style={[styles.createButtonContainer, {paddingBottom: bottom}]}>
                <AnimatedButton
                    style={styles.createButton}
                    textStyle={styles.createButtonText}
                    onPress={create}
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
        marginTop: 15,
    },
    titleText: {
        fontSize: 12,
        fontWeight: '500',
    },
    addProductText: {
        paddingHorizontal: 25,
        marginBottom: 10,
        marginTop: 20,
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
    loadingMoreIndicator: {
        marginTop: 10,
    },
});

export default CollectionNew;
