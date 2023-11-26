import {FlashList} from '@shopify/flash-list';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {
    View,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
    Modal,
    Pressable,
    Text,
    useWindowDimensions,
} from 'react-native';

import ProductListItem, {
    PRODUCT_LIST_ITEM_HEIGHT,
} from '@/components/Product/ProductListItem';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import SectionHeader from '@/components/Utility/SectionHeader';
import {PALETTE} from '@/constants';
import {useDeletedContext} from '@/context/deleted';
import {HEADER_HEIGHT_W_STATUS_BAR} from '@/nav/Headers';
import {Database} from '@/types/schema';

// const INITIAL_LOAD_AMOUNT = 10;
// const SUBSEQUENT_LOAD_AMOUNT = 10;
const ON_END_REACHED_THRESHOLD = 1;

const DeletedProducts = () => {
    const [modalVisible, setModalVisible] = useState(false);
    const [isDeletingAll, setIsDeletingAll] = useState(false);

    const {
        deletes,
        isLoadingDeletes,
        initFetchDeletes,
        hasInitiallyLoadedDeletes,
        deleteDeletedProduct,
        deleteAllDeletedProducts,
    } = useDeletedContext();
    const {height} = useWindowDimensions();

    const ListRef =
        useRef<FlashList<Database['public']['Views']['v_deletes']['Row']>>(
            null,
        );

    useEffect(() => {
        if (!hasInitiallyLoadedDeletes) {
            initFetchDeletes();
        }
    }, [hasInitiallyLoadedDeletes, initFetchDeletes]);

    const refresh = async () => {
        console.log('REFRESH');
    };

    const reload = useCallback(
        async (_: boolean) => {
            initFetchDeletes();
        },
        [initFetchDeletes],
    );

    // const loadMore = async () => {
    //     // TODO: Load more.
    // };

    const removeProduct = (
        product: Database['public']['Views']['v_products']['Row'],
    ) => {
        deleteDeletedProduct(product.id);
    };

    const deleteAllProducts = async () => {
        setIsDeletingAll(true);
        await deleteAllDeletedProducts();
        setIsDeletingAll(false);
    };

    const isEmpty = useMemo(() => {
        if (!isLoadingDeletes && !deletes.length) {
            return true;
        }

        return false;
    }, [isLoadingDeletes, deletes]);

    const EmptyComponent = useMemo(() => {
        if (isLoadingDeletes) {
            return (
                <View style={styles.loadingIndicator}>
                    <ActivityIndicator />
                </View>
            );
        }

        if (isEmpty) {
            const remainingHeight = height - HEADER_HEIGHT_W_STATUS_BAR;

            return (
                <View
                    style={[styles.emptyContainer, {height: remainingHeight}]}>
                    <Text style={styles.noProductsText}>
                        No deleted products. Get swiping, or try again.
                    </Text>
                    <View style={styles.refreshButtonContainer}>
                        <AnimatedButton
                            style={styles.refreshButton}
                            textStyle={styles.refreshButtonText}
                            onPress={() => reload(false)}>
                            Refresh
                        </AnimatedButton>
                    </View>
                </View>
            );
        }

        return <View />;
    }, [isLoadingDeletes, height, isEmpty, reload]);

    return (
        <View style={styles.container}>
            <FlashList
                ref={ListRef}
                data={deletes}
                keyExtractor={item => item.id.toString()}
                ListEmptyComponent={EmptyComponent}
                renderItem={({item, index}) => (
                    <ProductListItem
                        product={item}
                        index={index}
                        type="deleted"
                        onDelete={removeProduct}
                    />
                )}
                onEndReached={undefined}
                estimatedItemSize={PRODUCT_LIST_ITEM_HEIGHT}
                ListHeaderComponent={
                    !isEmpty && !isLoadingDeletes ? (
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
                    ) : undefined
                }
                ListFooterComponent={undefined}
                refreshControl={
                    !isLoadingDeletes ? (
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={isLoadingDeletes}
                        />
                    ) : undefined
                }
                onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
            />
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade">
                <Pressable
                    style={styles.modalPressable}
                    onPress={() => setModalVisible(false)}>
                    <Pressable style={styles.modalContainer}>
                        <View>
                            <SectionHeader>Reset Products</SectionHeader>
                            <Text style={styles.modalText}>
                                Are you sure you want to reset all deleted
                                products? This will reset all products you have
                                already seen, allowing them to show up on the
                                homepage again.
                            </Text>
                            <Text
                                style={[
                                    styles.modalText,
                                    styles.unsetMarginTop,
                                ]}>
                                This cannot be undone.
                            </Text>
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
                                        <ActivityIndicator />
                                    ) : (
                                        'Reset'
                                    )}
                                </AnimatedButton>
                            </View>
                        </View>
                    </Pressable>
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
        backgroundColor: PALETTE.red[7],
        borderRadius: 5,
        paddingVertical: 8,
    },
    resetAllButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
    modalPressable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContainer: {
        backgroundColor: '#FFF',
        width: '100%',
        padding: 10,
        borderRadius: 5,
        shadowColor: PALETTE.neutral[6],
        shadowOpacity: 0.6,
    },
    modalText: {
        color: PALETTE.neutral[6],
        fontSize: 12,
        marginVertical: 5,
        paddingHorizontal: 15,
    },
    buttonsContainer: {
        flexDirection: 'row',
        width: '100%',
    },
    buttonContainer: {
        flex: 1,
        padding: 5,
    },
    cancelButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center',
        backgroundColor: 'transparent',
    },
    cancelButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteButton: {
        padding: 7,
        backgroundColor: PALETTE.red[7],
        borderColor: PALETTE.red[7],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 5,
        width: '100%',
        alignSelf: 'center',
    },
    deleteButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    activityIndicator: {
        marginTop: 5,
    },
    unsetMarginTop: {
        marginTop: 0,
    },
    emptyContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    refreshButtonContainer: {
        paddingHorizontal: 10,
        width: '75%',
        marginTop: 5,
    },
    refreshButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
    },
    refreshButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    clearFiltersRefreshButton: {
        padding: 7,
        borderColor: PALETTE.neutral[8],
        backgroundColor: 'transparent',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginTop: 5,
    },
    clearFiltersRefreshButtonText: {
        color: PALETTE.neutral[8],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
    noProductsText: {
        color: PALETTE.neutral[4],
        fontSize: 12,
        paddingHorizontal: 5,
        paddingVertical: 3,
    },
    loadingIndicator: {marginTop: 25},
});

export default DeletedProducts;
