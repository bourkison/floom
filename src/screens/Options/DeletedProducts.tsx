import {queryProduct} from '@/api/product';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {Product} from '@/types/product';
import React, {useEffect, useState} from 'react';
import {
    View,
    ActivityIndicator,
    FlatList,
    ListRenderItem,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import ProductListItem from '@/components/Product/ProductListItem';
import {deleteSaveOrDelete} from '@/api/save';

const DeletedProducts = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [products, setProducts] = useState<Product[]>([]);
    const [moreToLoad, setMoreToLoad] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    useEffect(() => {
        const initFetch = async () => {
            await loadInit();
            setIsLoading(false);
        };

        setIsLoading(true);
        initFetch();
    }, []);

    const refresh = async () => {
        setIsRefreshing(true);
        await loadInit();
        setIsRefreshing(false);
    };

    const loadInit = async () => {
        const {products: p, __moreToLoad} = await queryProduct({
            init: {
                queryStringParameters: {loadAmount: 25, type: 'deleted'},
            },
        });

        setProducts(p);
        setMoreToLoad(__moreToLoad);
    };

    const loadMore = async () => {
        setIsLoadingMore(true);
        const {products: p, __moreToLoad} = await queryProduct({
            init: {
                queryStringParameters: {
                    loadAmount: 25,
                    type: 'deleted',
                    startAt: products[products.length - 1]._id,
                },
            },
        });

        setProducts([...products, ...p]);
        setMoreToLoad(__moreToLoad);
        setIsLoadingMore(false);
    };

    if (isLoading) {
        return <ActivityIndicator />;
    }

    const removeProduct = (_id: string, index: number) => {
        setProducts([
            ...products.slice(0, index),
            ...products.slice(index + 1),
        ]);
        deleteSaveOrDelete({
            productId: _id,
            init: {queryStringParameters: {type: 'delete'}},
        });
    };

    const ListItem: ListRenderItem<Product> = ({item, index}) => (
        <ProductListItem
            product={item}
            index={index}
            type="deleted"
            onDelete={removeProduct}
        />
    );

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
        backgroundColor: '#ce3b54',
        borderRadius: 5,
        paddingVertical: 8,
    },
    resetAllButtonText: {
        color: '#f3fcfa',
        fontSize: 14,
        textAlign: 'center',
        fontWeight: 'bold',
    },
});

export default DeletedProducts;
