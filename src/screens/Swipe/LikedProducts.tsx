import React, {useEffect, useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
    FlatList,
    ListRenderItem,
} from 'react-native';

import SavedProduct from '@/components/Product/SavedProduct';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {
    LOAD_MORE_SAVED_PRODUCTS,
    LOAD_SAVED_PRODUCTS,
} from '@/store/slices/product';
import {Product as ProductType} from '@/types/product';

const ON_END_REACHED_THRESHOLD = 100;

const SavedProducts = ({
    navigation,
}: StackScreenProps<MainStackParamList, 'LikedProducts'>) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [refreshing, setRefereshing] = useState(false);

    const dispatch = useAppDispatch();
    const savedProducts = useAppSelector(state => state.product.savedProducts);

    useEffect(() => {
        const initFetch = async () => {
            setIsLoading(true);
            await dispatch(LOAD_SAVED_PRODUCTS());
            setIsLoading(false);
        };

        if (savedProducts.length === 0) {
            initFetch();
        } else {
            setIsLoading(false);
        }
    }, []);

    const refresh = async () => {
        setRefereshing(true);
        await dispatch(LOAD_SAVED_PRODUCTS());
        setRefereshing(false);
    };

    const loadMore = async () => {
        if (!isLoadingMore) {
            setIsLoadingMore(true);
            await dispatch(LOAD_MORE_SAVED_PRODUCTS());
            setIsLoadingMore(false);
        }
    };

    const ListItem: ListRenderItem<ProductType> = ({item, index}) => (
        <SavedProduct product={item} index={index} />
    );

    return (
        <SafeAreaView style={styles.safeContainer}>
            {isLoading ? (
                <ActivityIndicator />
            ) : (
                <FlatList
                    style={styles.container}
                    data={savedProducts}
                    renderItem={ListItem}
                    keyExtractor={item => item._id}
                    onEndReached={loadMore}
                    onEndReachedThreshold={ON_END_REACHED_THRESHOLD}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <ActivityIndicator style={{marginTop: 5}} />
                        ) : undefined
                    }
                    refreshControl={
                        <RefreshControl
                            onRefresh={refresh}
                            refreshing={refreshing}
                        />
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeContainer: {
        flex: 1,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
    },
});

export default SavedProducts;
