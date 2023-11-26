import {SimpleLineIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import * as WebBrowser from 'expo-web-browser';
import React, {useMemo} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    useWindowDimensions,
    TouchableOpacity,
    TouchableHighlight,
} from 'react-native';

import AnimatedButton from '@/components/Utility/AnimatedButton';
import BrandLogo from '@/components/Utility/BrandLogo';
import {BUY_TEXT, IMAGE_RATIO, PALETTE, SAVE_COLOR} from '@/constants';
import {MainStackParamList} from '@/nav/Navigator';
import {formatPrice} from '@/services';
import {Database} from '@/types/schema';

type SaveListItemProps = {
    save: Database['public']['Views']['v_saves']['Row'];
};

const IMAGE_WIDTH_RATIO = 0.25;

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const SaveListItem = ({save}: SaveListItemProps) => {
    const {width} = useWindowDimensions();
    const IMAGE_WIDTH = width * IMAGE_WIDTH_RATIO;

    const onSale = useMemo(() => save.sale_price < save.price, [save]);

    const navigation = useNavigation<StackNavigationProp<MainStackParamList>>();

    const buyProduct = async () => {
        await WebBrowser.openBrowserAsync(save.link);
    };

    const navigateTo = () => {
        navigation.navigate('ProductView', {
            reference: 'saved',
            product: {
                brand: save.brand,
                brand_id: save.brand_id,
                colors: save.colors,
                created_at: save.created_at,
                deleted: false,
                description: save.description,
                gender: save.gender,
                id: save.product_id,
                images: save.images,
                in_stock: save.in_stock,
                link: save.link,
                name: save.name,
                partner: save.partner,
                partner_id: save.partner_id,
                price: save.price,
                sale_price: save.sale_price,
                product_type: save.product_type,
                saved: true,
                updated_at: save.updated_at,
                vendor_product_id: save.vendor_product_id,
            },
        });
    };

    return (
        <TouchableHighlight
            onPress={navigateTo}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    <Image
                        source={{uri: save.images[0]}}
                        style={{
                            width: IMAGE_WIDTH,
                            height: IMAGE_WIDTH / IMAGE_RATIO,
                        }}
                    />
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.topRowContainer}>
                        <View>
                            <Text style={styles.priceText}>
                                {formatPrice(save.price)}
                            </Text>

                            {onSale && (
                                <Text>{formatPrice(save.sale_price)}</Text>
                            )}
                        </View>

                        <View>
                            <TouchableOpacity>
                                <SimpleLineIcons name="options" size={16} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.titleContainer}>
                        <Text style={styles.titleText}>{save.name}</Text>
                    </View>

                    <View style={styles.inStockContainer}>
                        <Text style={styles.inStockText}>
                            {save.in_stock ? 'In stock' : 'Out of stock'}
                        </Text>
                    </View>

                    <View style={styles.logoContainer}>
                        <BrandLogo brand={save.brand} />
                    </View>

                    <View style={styles.buttonsContainer}>
                        <AnimatedButton style={styles.deleteButton}>
                            <Text style={styles.deleteText}>Remove</Text>
                        </AnimatedButton>

                        <View style={styles.flexOne}>
                            <AnimatedButton
                                style={styles.buyButton}
                                onPress={buyProduct}>
                                <Text style={styles.buyText}>{BUY_TEXT}</Text>
                            </AnimatedButton>
                        </View>
                    </View>
                </View>
            </View>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    container: {
        borderColor: PALETTE.neutral[2],
        borderBottomWidth: 1,
        width: '100%',
        backgroundColor: '#fff',
        paddingVertical: 15,
        paddingHorizontal: 10,
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    imageContainer: {},
    contentContainer: {
        marginLeft: 12,
        flex: 1,
        paddingTop: 10,
    },
    topRowContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    priceText: {
        fontSize: 18,
        fontWeight: '600',
    },
    titleContainer: {
        marginTop: 10,
    },
    titleText: {
        fontWeight: '300',
        fontSize: 15,
    },
    inStockContainer: {
        marginTop: 3,
    },
    inStockText: {
        fontWeight: '500',
        fontSize: 15,
    },
    logoContainer: {
        maxHeight: 16,
        marginTop: 7,
    },
    buttonsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        width: '100%',
        paddingRight: 20,
    },
    deleteButton: {
        borderColor: PALETTE.neutral[8],
        borderWidth: 2,
        paddingVertical: 3,
        paddingHorizontal: 15,
        borderRadius: 3,
        marginRight: 10,
    },
    deleteText: {
        color: PALETTE.neutral[8],
        fontWeight: '500',
        fontSize: 14,
    },
    buyButton: {
        backgroundColor: SAVE_COLOR,
        borderColor: SAVE_COLOR,
        borderWidth: 2,
        paddingVertical: 3,
        alignItems: 'center',
        borderRadius: 3,
    },
    buyText: {
        color: '#FFF',
        fontWeight: '500',
        fontSize: 14,
    },
    flexOne: {
        flex: 1,
    },
});

export default SaveListItem;
