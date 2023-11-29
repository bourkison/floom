import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {LinearGradient} from 'expo-linear-gradient';
import React, {useState, useEffect} from 'react';
import {
    ImageBackground,
    Image,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    TextStyle,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';

import AnimatedProduct from '@/components/Product/AnimatedProduct';
import BrandLogo from '@/components/Utility/BrandLogo';
import ImageIndicator from '@/components/Utility/ImageIndicator';
import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    IMAGE_GRADIENT_HEIGHT,
    DELETE_COLOR,
    SAVE_COLOR,
    IMAGE_PREFETCH_AMOUNT,
    PALETTE,
    IMAGE_ANIMATED_AMOUNT,
} from '@/constants';
import {capitaliseString, formatPrice} from '@/services';
import {RootStackParamList} from '@/types/nav';
import {Database} from '@/types/schema';

type ProductComponentProps = {
    product: Database['public']['Views']['v_products']['Row'];
    index: number;
};

const Product: React.FC<ProductComponentProps> = ({product, index}) => {
    const navigation = useNavigation();
    const route = useRoute<RouteProp<RootStackParamList, 'Home'>>();

    const {width} = useWindowDimensions();

    const [imageIndex, setImageIndex] = useState(0);
    const [prefetchedImages, setPrefetchedImages] = useState<string[]>([]);

    const [isLoadingImage, setIsLoadingImage] = useState(true);
    const [loadingImageTimeout, setLoadingImageTimeout] = useState<
        NodeJS.Timeout | undefined
    >();

    useEffect(() => {
        if (index === 0 && route.params && route.params.imageIndex) {
            setImageIndex(route.params.imageIndex);
            navigation.setParams({imageIndex: undefined});
        }
    }, [route, index, imageIndex, navigation]);

    // Prefetch next images.
    useEffect(() => {
        for (let i = 1; i < IMAGE_PREFETCH_AMOUNT; i++) {
            const img = product.images[imageIndex + i];

            if (img && !prefetchedImages.includes(img)) {
                Image.prefetch(img);
                setPrefetchedImages(prefetched => [...prefetched, img]);
            }
        }
    }, [imageIndex, product, prefetchedImages]);

    const calculateSavedOrDeletedStyle = (type: 'text' | 'container') => {
        const response: ViewStyle[] | TextStyle[] = [];

        if (type === 'container') {
            response.push(styles.savedOrDeletedContainer);

            if (product.saved) {
                response.push(styles.savedContainer);
            } else if (product.deleted) {
                response.push(styles.deletedContainer);
            }
        } else {
            response.push(styles.savedOrDeletedText);

            if (product.saved) {
                response.push(styles.savedText);
            } else if (product.deleted) {
                response.push(styles.deletedText);
            }
        }

        return response;
    };

    // Only set loader after a defined amount of seconds of loading
    // To avoid loader showing up when  retrieving from cache
    const setLoader = (loading: boolean) => {
        const AMOUNT_TO_WAIT = 200;

        if (loading) {
            // Set image interval to a new timeout.
            // In this timeout, we then set it to undefined once finished and clear the interval.
            setLoadingImageTimeout(interval => {
                return setTimeout(() => {
                    setIsLoadingImage(true);
                    clearTimeout(interval);
                    setLoadingImageTimeout(undefined);
                }, AMOUNT_TO_WAIT);
            });
        } else {
            // Else just clear the current timeout and set interval to undefined
            setIsLoadingImage(false);
            clearTimeout(loadingImageTimeout);
            setLoadingImageTimeout(undefined);
        }
    };

    const baseComponent = (
        <View
            style={[
                styles.container,
                {zIndex: 5 - index, elevation: 5 - index},
            ]}>
            <ImageBackground
                style={[
                    styles.image,
                    {
                        width: width - IMAGE_PADDING,
                        height: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    },
                    {zIndex: 5 - index, elevation: 5 - index},
                ]}
                source={{
                    uri: product.images[imageIndex],
                }}
                onLoadStart={() => setLoader(true)}
                onLoad={() => setLoader(false)}>
                <View style={styles.selectedImageContainer}>
                    <ImageIndicator
                        amount={product.images.length}
                        selectedIndex={imageIndex}
                    />
                </View>
                <View style={calculateSavedOrDeletedStyle('container')}>
                    <Text style={calculateSavedOrDeletedStyle('text')}>
                        {product.saved
                            ? 'Saved'
                            : product.deleted
                              ? 'Deleted'
                              : undefined}
                    </Text>
                </View>
                <View style={styles.imageOverlayContainer}>
                    <View style={styles.gradientContainer}>
                        <LinearGradient
                            colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0.6)']}
                            style={styles.linearGradient}>
                            <View style={styles.textContainer}>
                                <View style={styles.leftContainer}>
                                    <View style={styles.titleContainer}>
                                        <Text style={styles.titleText}>
                                            {capitaliseString(product.name)}
                                        </Text>
                                    </View>
                                    <View style={styles.brandContainer}>
                                        <BrandLogo brand={product.brand} />
                                    </View>
                                </View>
                                <View style={styles.priceContainer}>
                                    <Text style={styles.priceText}>
                                        {formatPrice(product.price)}
                                    </Text>
                                </View>
                            </View>
                        </LinearGradient>
                    </View>
                </View>
                {isLoadingImage ? (
                    <ActivityIndicator style={styles.loadingImage} />
                ) : undefined}
            </ImageBackground>
        </View>
    );

    // Animated more images to prevent flickering on component change.
    if (index < IMAGE_ANIMATED_AMOUNT) {
        return (
            <AnimatedProduct
                imageIndex={imageIndex}
                setImageIndex={setImageIndex}
                product={product}
                index={index}>
                {baseComponent}
            </AnimatedProduct>
        );
    } else {
        return baseComponent;
    }
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 1,
            width: 1,
        },
        shadowOpacity: 0.2,
    },
    selectedImageContainer: {
        position: 'absolute',
        top: 14,
        left: 0,
        right: 0,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    imageOverlayContainer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        flex: 1,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    gradientContainer: {
        position: 'absolute',
        bottom: 0,
        width: '100%',
        height: IMAGE_GRADIENT_HEIGHT,
    },
    linearGradient: {
        flex: 1,
    },
    titleText: {
        color: '#f3fcf0',
        fontWeight: 'bold',
        fontSize: 18,
        marginBottom: 3,
    },
    priceText: {
        color: '#f3fcf0',
        textAlign: 'right',
        fontSize: 18,
        fontWeight: 'bold',
    },
    textContainer: {
        position: 'absolute',
        bottom: 0,
        padding: 10,
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    image: {
        borderRadius: 5,
        backgroundColor: PALETTE.neutral[2],
        overflow: 'hidden',
    },
    leftContainer: {flex: 3},
    titleContainer: {flex: 1},
    priceContainer: {flex: 1},
    brandContainer: {height: 24},
    savedOrDeletedContainer: {
        position: 'absolute',
        borderRadius: 3,
        borderWidth: 1,
        paddingVertical: 5,
        top: 35,
        width: 96,
        opacity: 0,
    },
    deletedContainer: {
        left: 10,
        transform: [{rotate: '-15deg'}],
        opacity: 1,
        borderColor: DELETE_COLOR + 'b3',
    },
    savedContainer: {
        right: 10,
        transform: [{rotate: '15deg'}],
        opacity: 1,
        borderColor: SAVE_COLOR + 'b3',
    },
    savedOrDeletedText: {
        fontWeight: '500',
        fontSize: 14,
        textAlign: 'center',
    },
    savedText: {
        color: SAVE_COLOR + 'b3',
    },
    deletedText: {
        color: DELETE_COLOR + 'b3',
    },
    loadingImage: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
    },
});

export default Product;
