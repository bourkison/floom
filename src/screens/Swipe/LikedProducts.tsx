import React, {useEffect, useRef, useState} from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {
    SafeAreaView,
    StyleSheet,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import {ScrollView} from 'react-native-gesture-handler';

import SavedProduct from '@/components/Product/SavedProduct';
import {useAppSelector, useAppDispatch} from '@/store/hooks';
import {LOAD_SAVED_PRODUCTS} from '@/store/slices/product';

const SavedProducts = ({
    navigation,
}: StackScreenProps<MainStackParamList, 'LikedProducts'>) => {
    const [isLoading, setIsLoading] = useState(false);
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
        console.log('REFRESHING');
        setRefereshing(true);
        await dispatch(LOAD_SAVED_PRODUCTS());
        setRefereshing(false);
    };

    return (
        <SafeAreaView style={styles.safeContainer}>
            <ScrollView
                style={styles.container}
                refreshControl={
                    <RefreshControl
                        onRefresh={refresh}
                        refreshing={refreshing}
                    />
                }>
                {isLoading ? (
                    <ActivityIndicator />
                ) : (
                    savedProducts.map((product, index) => (
                        <SavedProduct
                            product={product}
                            key={product._id}
                            index={index}
                        />
                    ))
                )}
            </ScrollView>
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
