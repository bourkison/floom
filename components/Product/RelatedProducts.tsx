import {Ionicons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
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
import {formatPrice} from '@/services';
import {supabase} from '@/services/supabase';
import {RootStackScreenProps} from '@/types/nav';
import {Database} from '@/types/schema';

const ITEMS_PER_SCREEN_WIDTH = 2.9;

type RelatedProductsProps = {
    type: 'similarProducts' | 'peopleAlsoBought';
    relatedProduct: Database['public']['Views']['v_products']['Row'];
};

const RelatedProducts = ({type, relatedProduct}: RelatedProductsProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [products, setProducts] = useState<
        Database['public']['Views']['v_products']['Row'][]
    >([]);

    useEffect(() => {
        // TODO: Alter query based on type.
        const fetchProducts = async () => {
            setIsLoading(true);

            let query = supabase.from('v_products').select();

            if (type === 'similarProducts') {
                query = query
                    .eq('gender', relatedProduct.gender)
                    .eq('product_type', relatedProduct.product_type);
            } else if (type === 'peopleAlsoBought') {
                query = query
                    .eq('gender', relatedProduct.gender)
                    .order('sale_price', {ascending: false});
            }

            const {data, error} = await query.limit(12);

            setIsLoading(false);

            if (error) {
                console.error(error);
                return;
            }

            setProducts(data);
        };

        if (!products.length) {
            fetchProducts();
        }
    }, [relatedProduct, type, products]);

    const {width} = useWindowDimensions();
    const navigation =
        useNavigation<RootStackScreenProps<'ProductView'>['navigation']>();

    const itemWidth = useMemo(() => width / ITEMS_PER_SCREEN_WIDTH, [width]);
    const itemHeight = useMemo(() => itemWidth / IMAGE_RATIO, [itemWidth]);

    const header = useMemo(() => {
        if (type === 'similarProducts') {
            return 'Similar Products';
        }

        return 'People Also Bought';
    }, [type]);

    return (
        <View>
            <View style={styles.headerContainer}>
                <Text style={styles.headerText}>{header}</Text>
            </View>

            <View style={styles.contentContainer}>
                {!isLoading ? (
                    <ScrollView horizontal>
                        {products.map(product => (
                            <TouchableOpacity
                                key={product.id}
                                onPress={() =>
                                    navigation.push('ProductView', {product})
                                }
                                style={[
                                    styles.relatedProductContainer,
                                    {width: itemWidth},
                                ]}>
                                <Image
                                    style={{
                                        width: itemWidth,
                                        height: itemHeight,
                                    }}
                                    source={{uri: product.images[0]}}
                                />

                                <View style={styles.productDetailsContainer}>
                                    <View style={styles.topRowContainer}>
                                        <Text style={styles.priceText}>
                                            {formatPrice(product.price)}
                                        </Text>

                                        <TouchableOpacity
                                            onPress={() => console.log('save')}>
                                            {product.saved ? (
                                                <Ionicons
                                                    name="heart"
                                                    color={PALETTE.neutral[8]}
                                                    size={18}
                                                />
                                            ) : (
                                                <Ionicons
                                                    name="heart-outline"
                                                    color={PALETTE.neutral[8]}
                                                    size={18}
                                                />
                                            )}
                                        </TouchableOpacity>
                                    </View>

                                    <View style={styles.nameContainer}>
                                        <Text
                                            style={styles.nameText}
                                            numberOfLines={2}>
                                            {product.name}
                                        </Text>
                                    </View>
                                </View>
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
        marginHorizontal: 10,
        marginBottom: 10,
    },
    priceText: {
        fontWeight: '600',
        fontSize: 14,
        color: PALETTE.neutral[8],
    },
    productDetailsContainer: {
        marginTop: 15,
    },
    topRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    nameContainer: {
        marginTop: 5,
    },
    nameText: {
        fontWeight: '300',
        fontSize: 12,
        color: PALETTE.neutral[8],
    },
});

export default RelatedProducts;
