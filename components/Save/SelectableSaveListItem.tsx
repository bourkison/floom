import {Ionicons} from '@expo/vector-icons';
import React, {useMemo} from 'react';
import {
    View,
    Text,
    Image,
    StyleSheet,
    useWindowDimensions,
    TouchableHighlight,
} from 'react-native';

import BrandLogo from '@/components/Utility/BrandLogo';
import {IMAGE_RATIO, PALETTE, SAVE_COLOR} from '@/constants';
import {formatPrice} from '@/services';
import {Database} from '@/types/schema';

type SelectableSaveListItemProps = {
    save: Database['public']['Views']['v_saves']['Row'];
    onSelect: (product: Database['public']['Views']['v_saves']['Row']) => void;
    selected: boolean;
};

const IMAGE_WIDTH_RATIO = 0.25;

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const RADIO_DIAMETER = 20;

const SelectableSaveListItem = ({
    save,
    onSelect,
    selected,
}: SelectableSaveListItemProps) => {
    const {width} = useWindowDimensions();
    const IMAGE_WIDTH = width * IMAGE_WIDTH_RATIO;

    const select = () => {
        onSelect(save);
    };

    const onSale = useMemo(() => save.sale_price < save.price, [save]);

    return (
        <TouchableHighlight
            onPress={select}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.container}>
                <View style={styles.selectedContainerContainer}>
                    <View style={styles.selectedContainer}>
                        <View
                            style={[
                                styles.selectedRadio,
                                selected
                                    ? styles.selectedRadioSelected
                                    : undefined,
                            ]}>
                            {selected && (
                                <Ionicons
                                    name="checkmark"
                                    color="#FFF"
                                    size={15}
                                />
                            )}
                        </View>
                    </View>
                </View>

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
    selectedContainerContainer: {
        justifyContent: 'center',
        marginRight: 15,
    },
    selectedContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedRadio: {
        width: RADIO_DIAMETER,
        height: RADIO_DIAMETER,
        borderRadius: RADIO_DIAMETER / 2,
        borderColor: PALETTE.neutral[8],
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedRadioSelected: {
        backgroundColor: PALETTE.neutral[8],
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
        marginTop: 7,
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

export default SelectableSaveListItem;
