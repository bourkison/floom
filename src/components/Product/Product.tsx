import React, {useState, useMemo} from 'react';
import {
    ImageBackground,
    StyleSheet,
    Text,
    View,
    ViewStyle,
    TextStyle,
} from 'react-native';
import {Product as ProductType} from '@/types/product';
import {LinearGradient} from 'expo-linear-gradient';
import {useWindowDimensions} from 'react-native';
import AnimatedProduct from '@/components/Product/AnimatedProduct';

import {useEffect} from 'react';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';

import {MainStackParamList} from '@/nav/Navigator';
import {StackNavigationProp} from '@react-navigation/stack';

import {
    IMAGE_RATIO,
    IMAGE_PADDING,
    IMAGE_GRADIENT_HEIGHT,
    FALLBACK_IMAGE,
    DELETE_COLOR,
    SAVE_COLOR,
} from '@/constants';
import {capitaliseString, formatPrice} from '@/services';

import BrandLogo from '@/components/Utility/BrandLogo';

type ProductComponentProps = {
    product: ProductType;
    index: number;
};

const SCALE_AMOUNT = 0;

const Product: React.FC<ProductComponentProps> = ({product, index}) => {
    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();
    const route = useRoute<RouteProp<MainStackParamList, 'Home'>>();

    const {width, height: windowHeight} = useWindowDimensions();

    const [imageIndex, setImageIndex] = useState(0);

    useEffect(() => {
        if (
            index === 0 &&
            route.params &&
            route.params.imageIndex &&
            route.params.imageIndex !== imageIndex
        ) {
            setImageIndex(route.params.imageIndex);
            navigation.setParams({imageIndex: undefined});
        }
    }, [route, index, imageIndex, navigation]);

    const translateY = useMemo(() => {
        const height = (width - IMAGE_PADDING) / IMAGE_RATIO;
        return -Math.floor((height * SCALE_AMOUNT * index) / 4);
    }, [index, width]);

    const calculateImageIndicator = (i: number) => {
        let style: ViewStyle = JSON.parse(
            JSON.stringify(styles.selectedImageIndicator),
        );

        if (imageIndex === i) {
            style.backgroundColor = 'rgba(243, 252, 240, 0.8)';
        }

        if (i === 0) {
            style.marginLeft = 0;
        }

        if (i === product.images.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

    const calculateSavedOrDeletedStyle = (type: 'text' | 'container') => {
        let response: ViewStyle[] | TextStyle[] = [];

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

    let baseComponent = (
        <View
            style={[
                styles.container,
                {
                    transform: [
                        {scale: 1 + index * SCALE_AMOUNT},
                        {
                            translateY: translateY,
                        },
                    ],
                },
                {zIndex: 20 - index, elevation: 20 - index},
            ]}>
            <ImageBackground
                style={[
                    styles.image,
                    {
                        width: width - IMAGE_PADDING,
                        height: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    },
                    {zIndex: 20 - index, elevation: 20 - index},
                ]}
                source={{
                    uri: product.images[imageIndex] || FALLBACK_IMAGE,
                }}>
                <View style={styles.selectedImageContainer}>
                    {product.images.map((s, i) => (
                        <View style={calculateImageIndicator(i)} key={i} />
                    ))}
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
                            colors={['#00000000', '#000000']}
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
            </ImageBackground>
        </View>
    );

    if (index === 0) {
        return (
            <AnimatedProduct
                imageIndex={imageIndex}
                setImageIndex={setImageIndex}
                product={product}
                width={width}
                windowHeight={windowHeight}>
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
        top: 0,
        left: 0,
        right: 0,
        flex: 1,
        height: 8,
        justifyContent: 'center',
        flexDirection: 'row',
    },
    selectedImageIndicator: {
        flex: 1,
        marginLeft: 3,
        marginRight: 3,
        borderRadius: 2,
        backgroundColor: 'rgba(26, 31, 37, 0.3)',
        maxWidth: '33%',
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
});

export default Product;
