import React, {useEffect, useMemo, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    useWindowDimensions,
    Image,
    ScrollView,
} from 'react-native';
import {TouchableOpacity} from 'react-native-gesture-handler';

import {IMAGE_RATIO, PALETTE} from '@/constants';
import {supabase} from '@/services/supabase';
import {Database} from '@/types/schema';

const ITEMS_PER_SCREEN_WIDTH = 2.9;

const RelatedProducts = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<
        Database['public']['Views']['v_products']['Row'][]
    >([]);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            const {data, error} = await supabase
                .from('v_products')
                .select()
                .limit(16);
            setIsLoading(false);

            if (error) {
                console.error(error);
                return;
            }

            setProducts(data);
        };

        fetchProducts();
    }, []);

    const {width} = useWindowDimensions();

    const itemWidth = useMemo(() => width / ITEMS_PER_SCREEN_WIDTH, [width]);
    const itemHeight = useMemo(() => itemWidth / IMAGE_RATIO, [itemWidth]);

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>People Also Bought</Text>
            </View>

            <View style={styles.contentContainer}>
                {!isLoading ? (
                    <ScrollView horizontal>
                        {products.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                style={styles.relatedProductContainer}>
                                <Image
                                    style={{
                                        width: itemWidth,
                                        height: itemHeight,
                                    }}
                                    source={{uri: product.images[0]}}
                                />
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <ActivityIndicator
                        style={{marginVertical: itemHeight / 2}}
                    />
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {},
    headerContainer: {
        paddingHorizontal: 20,
    },
    headerText: {
        fontWeight: '500',
        fontSize: 12,
        textTransform: 'uppercase',
        color: PALETTE.neutral[8],
        letterSpacing: -0.3,
    },
    contentContainer: {
        flexDirection: 'row',
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 5,
    },
    activityIndicator: {},
    relatedProductContainer: {
        marginRight: 15,
        marginBottom: 10,
    },
});

export default RelatedProducts;
