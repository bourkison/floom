import {AntDesign, Feather, Ionicons} from '@expo/vector-icons';
import {StackScreenProps} from '@react-navigation/stack';
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    ActivityIndicator,
    Pressable,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import RelatedProducts from '@/components/Product/RelatedProducts';
import AddToCollectionBottomSheet from '@/components/Save/AddToCollectionSheet';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import ImageCarousel from '@/components/Utility/ImageCarousel';
import {IMAGE_RATIO, PALETTE, SAVE_COLOR} from '@/constants';
import {useBottomSheetContext} from '@/context/BottomSheet';
import {formatPrice} from '@/services';
import {supabase} from '@/services/supabase';
import {RootStackParamList} from '@/types/nav';
import {Database} from '@/types/schema';

const HEADER_BAR_ICON_SIZE = 22;

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<RootStackParamList, 'ProductView'>) => {
    const {width} = useWindowDimensions();
    const [isLoading, setIsLoading] = useState(false);
    const [product, setProduct] =
        useState<Database['public']['Views']['v_products']['Row']>();

    const {top, bottom} = useSafeAreaInsets();
    const {openBottomSheet} = useBottomSheetContext();

    useEffect(() => {
        const fetchProduct = async () => {
            setIsLoading(true);

            if (typeof route.params.product !== 'number') {
                setProduct(route.params.product);
                setIsLoading(false);
                return;
            }

            const {data, error} = await supabase
                .from('v_products')
                .select()
                .eq('id', route.params.product)
                .limit(1)
                .single();

            if (error) {
                throw new Error(error.message);
            }

            setProduct(data);
        };

        fetchProduct();
    }, [route]);

    const toggleSave = () => {
        if (!product) {
            return;
        }

        setProduct({...product, saved: !product.saved});
    };

    if (isLoading) {
        // TODO: Flesh out loading screen.

        return (
            <View style={styles.container}>
                <ActivityIndicator />
            </View>
        );
    }

    if (!product) {
        // TODO: Flesh out error screen.

        return (
            <View style={styles.container}>
                <Text>Something has gone wrong.</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={[styles.headerBar, {top}]}>
                <Pressable onPress={() => navigation.goBack()}>
                    <Feather
                        name="x"
                        size={HEADER_BAR_ICON_SIZE}
                        color={PALETTE.neutral[7]}
                    />
                </Pressable>

                <View>
                    <Feather
                        name="share"
                        size={HEADER_BAR_ICON_SIZE}
                        color={PALETTE.neutral[8]}
                    />
                </View>
            </View>
            <ScrollView contentContainerStyle={{paddingBottom: bottom}}>
                <View style={styles.imageContainer}>
                    <ImageCarousel
                        images={product.images}
                        width={width}
                        height={width / IMAGE_RATIO}
                    />
                </View>

                <View style={styles.saveButtonsContainer}>
                    <TouchableOpacity
                        style={styles.saveProductContainer}
                        onPress={toggleSave}>
                        {product.saved ? (
                            <Ionicons
                                name="heart"
                                color={PALETTE.neutral[8]}
                                size={28}
                            />
                        ) : (
                            <Ionicons
                                name="heart-outline"
                                color={PALETTE.neutral[8]}
                                size={28}
                            />
                        )}

                        <Text style={styles.saveText}>
                            {product.saved ? 'Saved' : 'Save'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.collectionContainer}
                        onPress={() =>
                            openBottomSheet(
                                <AddToCollectionBottomSheet
                                    selectedSaves={[]}
                                    onSelect={() => console.log('blah')}
                                />,
                                0.6,
                            )
                        }>
                        <AntDesign
                            name="plus"
                            size={28}
                            color={PALETTE.neutral[8]}
                        />
                        <Text style={styles.saveText}>Add to Board</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contentContainer}>
                    <View style={styles.colorsContainer}>
                        <Text style={styles.colorHeader}>Colour:</Text>
                        <Text style={[styles.colorHeader, styles.colorText]}>
                            {product.colors.join(', ')}
                        </Text>
                    </View>

                    <View style={styles.inStockContainer}>
                        {product.in_stock ? (
                            <Text style={styles.inStockText}>In Stock</Text>
                        ) : (
                            <Text style={styles.outOfStockText}>
                                Out of Stock
                            </Text>
                        )}
                    </View>

                    <View style={styles.priceContainer}>
                        <Text style={styles.priceText}>
                            {formatPrice(product.price)}
                        </Text>
                    </View>

                    <View style={styles.nameContainer}>
                        <Text style={styles.nameText}>{product.name}</Text>
                    </View>

                    <View style={styles.buyButtonContainer}>
                        <AnimatedButton
                            style={styles.buyButton}
                            textStyle={styles.buyButtonText}>
                            Buy
                        </AnimatedButton>
                    </View>

                    <View style={styles.descriptionContainer}>
                        <Text style={styles.descriptionHeader}>
                            Description
                        </Text>
                        <Text style={styles.descriptionText}>
                            {product.description}
                        </Text>
                    </View>

                    <View style={styles.colorsContainer}>
                        <Text style={styles.colorHeader}>Brand:</Text>
                        <Text style={[styles.colorHeader, styles.colorText]}>
                            {product.brand}
                        </Text>
                    </View>

                    <View style={styles.soldByContainer}>
                        <Text style={styles.colorHeader}>Sold By:</Text>
                        <Text style={[styles.colorHeader, styles.colorText]}>
                            {product.partner}
                        </Text>
                    </View>
                </View>
                <View style={styles.relatedProductsContainer}>
                    <RelatedProducts
                        type="similarProducts"
                        relatedProduct={product}
                    />
                </View>

                <View style={styles.relatedProductsContainer}>
                    <RelatedProducts
                        type="peopleAlsoBought"
                        relatedProduct={product}
                    />
                </View>

                <View style={[styles.bottomButtonsContainer]}>
                    <TouchableOpacity style={styles.reportContainer}>
                        <AntDesign
                            name="warning"
                            size={24}
                            color={PALETTE.neutral[8]}
                        />
                        <Text style={styles.reportText}>Report Issue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.hideContainer}>
                        <Feather
                            name="x"
                            size={24}
                            color={PALETTE.neutral[8]}
                        />
                        <Text style={styles.hideText}>Hide Product</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerBar: {
        top: 0,
        left: 0,
        right: 0,
        position: 'absolute',
        paddingHorizontal: 20,
        marginTop: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 9,
    },
    hiddenCloseIconContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        marginTop: 15,
    },
    imageContainer: {},
    image: {},
    saveButtonsContainer: {
        paddingVertical: 15,
        borderColor: PALETTE.neutral[2],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    saveProductContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    saveText: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: '300',
    },
    collectionContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentContainer: {
        paddingHorizontal: 20,
    },
    colorsContainer: {
        flexDirection: 'row',
        marginTop: 15,
        alignItems: 'center',
    },
    colorHeader: {
        fontWeight: '500',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.1,
    },
    colorText: {
        fontWeight: '300',
        marginLeft: 3,
        textTransform: 'capitalize',
    },
    inStockContainer: {
        marginTop: 7,
    },
    inStockText: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: -0.4,
        fontWeight: '500',
    },
    outOfStockText: {
        fontSize: 12,
        textTransform: 'uppercase',
        letterSpacing: -0.4,
        fontWeight: '500',
        color: PALETTE.red[6],
    },
    priceContainer: {
        marginTop: 10,
    },
    priceText: {
        fontWeight: '600',
        fontSize: 20,
        color: PALETTE.neutral[8],
    },
    nameContainer: {
        marginTop: 3,
    },
    nameText: {
        fontWeight: '300',
        fontSize: 12,
    },
    buyButtonContainer: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    buyButton: {
        width: '100%',
        backgroundColor: SAVE_COLOR,
        paddingVertical: 10,
        justifyContent: 'center',
        alignItems: 'center',
    },
    buyButtonText: {
        color: PALETTE.neutral[0],
        fontWeight: '500',
        fontSize: 14,
        textTransform: 'uppercase',
        letterSpacing: 1.9,
        borderRadius: 3,
    },
    descriptionContainer: {
        marginTop: 25,
    },
    descriptionHeader: {
        fontWeight: '500',
        fontSize: 11,
        textTransform: 'uppercase',
        letterSpacing: 0.1,
    },
    descriptionText: {
        fontWeight: '300',
        fontSize: 12,
        marginTop: 4,
    },
    relatedProductsContainer: {
        marginTop: 40,
    },
    soldByContainer: {
        flexDirection: 'row',
    },
    bottomButtonsContainer: {
        flexDirection: 'row',
        paddingTop: 15,
        paddingBottom: 10,
        marginTop: 25,
        borderColor: PALETTE.neutral[2],
        borderTopWidth: 1,
    },
    reportContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    reportText: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: '300',
    },
    hideContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    hideText: {
        fontSize: 10,
        marginTop: 6,
        fontWeight: '300',
    },
});

export default ProductView;
