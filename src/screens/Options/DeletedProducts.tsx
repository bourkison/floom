import AnimatedButton from '@/components/Utility/AnimatedButton';
import {Product} from '@/types/product';
import React, {useCallback, useEffect, useState} from 'react';
import {
    View,
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    StyleSheet,
    RefreshControl,
    Modal,
    Pressable,
    Text,
} from 'react-native';
import Spinner from '@/components/Utility/Spinner';
import ProductListItem from '@/components/Product/ProductListItem';
import {DELETE_COLOR, PALETTE} from '@/constants';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {
    DELETE_ALL_DELETED_PRODUCTS,
    DELETE_DELETED_PRODUCT,
    LOAD_DELETED_PRODUCTS,
} from '@/store/slices/product';

const DeletedProducts = () => {
    const isLoading = useAppSelector(state => state.product.deleted.isLoading);
    const products = useAppSelector(state => state.product.deleted.products);
    const moreToLoad = useAppSelector(
        state => state.product.deleted.moreToLoad,
    );
    const isLoadingMore = useAppSelector(
        state => state.product.deleted.isLoadingMore,
    );

    const [isRefreshing, setIsRefreshing] = useState(false);

    const [modalVisible, setModalVisible] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const dispatch = useAppDispatch();

    const loadInit = useCallback(async () => {
        dispatch(
            LOAD_DELETED_PRODUCTS({
                queryStringParameters: {
                    loadAmount: 25,
                    type: 'deleted',
                    reversed: true,
                },
                loadType: 'initial',
            }),
        );
    }, [dispatch]);

    useEffect(() => {
        const initFetch = async () => {
            await loadInit();
        };

        initFetch();
    }, [loadInit]);

    const refresh = async () => {
        setIsRefreshing(true);
        await dispatch(
            LOAD_DELETED_PRODUCTS({
                queryStringParameters: {
                    loadAmount: 25,
                    type: 'deleted',
                    reversed: true,
                },
                loadType: 'refresh',
            }),
        );
        setIsRefreshing(false);
    };

    const loadMore = async () => {
        if (moreToLoad) {
            dispatch(
                LOAD_DELETED_PRODUCTS({
                    queryStringParameters: {
                        loadAmount: 25,
                        type: 'deleted',
                        startAt: products[products.length - 1]._id,
                        reversed: true,
                    },
                    loadType: 'more',
                }),
            );
        }
    };

    const removeProduct = (_id: string, index: number) => {
        dispatch(DELETE_DELETED_PRODUCT({_id, index}));
    };

    const deleteAllProducts = async () => {
        setIsDeletingAll(!isDeletingAll);
        await dispatch(DELETE_ALL_DELETED_PRODUCTS());
        setIsDeletingAll(false);
        setModalVisible(false);
    };

    const ListItem: ListRenderItem<Product> = ({item, index}) => (
        <ProductListItem
            product={item}
            index={index}
            type="deleted"
            onDelete={removeProduct}
        />
    );

    if (isLoading) {
        return <ActivityIndicator />;
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={item => item._id}
                renderItem={ListItem}
                onEndReached={
                    moreToLoad && !isLoadingMore ? loadMore : undefined
                }
                ListHeaderComponent={
                    <View style={styles.resetAllButtonContainer}>
                        <AnimatedButton
                            onPress={() => {
                                setModalVisible(true);
                            }}
                            style={styles.resetAllButton}
                            textStyle={styles.resetAllButtonText}>
                            Reset All
                        </AnimatedButton>
                    </View>
                }
                ListFooterComponent={
                    isLoadingMore ? <ActivityIndicator /> : undefined
                }
                refreshControl={
                    <RefreshControl
                        onRefresh={refresh}
                        refreshing={isRefreshing}
                    />
                }
            />
            <Modal visible={modalVisible} transparent={true}>
                <Pressable
                    style={styles.modalContainer}
                    onPress={() => {
                        setModalVisible(false);
                    }}>
                    <View style={styles.modalBox}>
                        <Pressable style={styles.modalPressable}>
                            <View style={styles.warningContainer}>
                                <Text>Are you sure you want to reset all?</Text>
                                <Text>This cannot be undone.</Text>
                            </View>
                            <View style={styles.buttonsContainer}>
                                <View style={styles.buttonContainer}>
                                    <AnimatedButton
                                        style={styles.cancelButton}
                                        textStyle={styles.cancelButtonText}
                                        onPress={() => {
                                            setModalVisible(false);
                                        }}>
                                        Go Back
                                    </AnimatedButton>
                                </View>
                                <View style={styles.buttonContainer}>
                                    <AnimatedButton
                                        style={styles.deleteButton}
                                        textStyle={styles.deleteButtonText}
                                        onPress={deleteAllProducts}
                                        disabled={isDeletingAll}>
                                        {isDeletingAll ? (
                                            <Spinner
                                                diameter={15}
                                                spinnerWidth={2}
                                                spinnerColor="#f3fcfa"
                                                backgroundColor={DELETE_COLOR}
                                            />
                                        ) : (
                                            'Delete'
                                        )}
                                    </AnimatedButton>
                                </View>
                            </View>
                        </Pressable>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    deletedProductContainer: {
        flex: 1,
    },
    resetAllButtonContainer: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 25,
    },
    resetAllButton: {
        flex: 1,
        backgroundColor: PALETTE.red[5],
        borderRadius: 5,
        paddingVertical: 8,
    },
    resetAllButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 15,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
    },
    modalBox: {
        flexBasis: 104,
        flexGrow: 0,
        flexShrink: 0,
        width: '100%',
        backgroundColor: 'white',
        borderRadius: 5,
        padding: 5,
    },
    modalPressable: {
        flex: 1,
    },
    buttonsContainer: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 10,
        paddingVertical: 10,
    },
    buttonContainer: {
        flex: 1,
        paddingHorizontal: 2,
    },
    cancelButton: {
        borderColor: '#1a1f25',
        borderWidth: 2,
        padding: 5,
        borderRadius: 3,
    },
    cancelButtonText: {
        textAlign: 'center',
    },
    deleteButton: {
        backgroundColor: DELETE_COLOR,
        padding: 5,
        paddingVertical: 7,
        borderRadius: 3,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteButtonText: {
        color: '#f3fcfa',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    warningContainer: {
        paddingHorizontal: 10,
        paddingTop: 10,
    },
});

export default DeletedProducts;
