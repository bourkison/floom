import {SimpleLineIcons} from '@expo/vector-icons';
import {useNavigation} from '@react-navigation/native';
import {StackNavigationProp} from '@react-navigation/stack';
import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Image,
    TouchableHighlight,
    TouchableOpacity,
} from 'react-native';

import {IMAGE_RATIO, PALETTE} from '@/constants';
import {CollectionType} from '@/context/saved';
import {SavedStackParamList} from '@/nav/SavedNavigator';

type CollectionListItemProps = {
    collection: CollectionType;
};

const IMAGE_WIDTH_RATIO = 0.25;

const TOUCHABLE_UNDERLAY = PALETTE.neutral[2];
const TOUCHABLE_ACTIVE_OPACITY = 0.7;

const CollectionListItem = ({collection}: CollectionListItemProps) => {
    const {width} = useWindowDimensions();
    const IMAGE_WIDTH = width * IMAGE_WIDTH_RATIO;

    const navigation =
        useNavigation<StackNavigationProp<SavedStackParamList, 'SavedHome'>>();

    const navigateTo = () => {
        navigation.navigate('CollectionView', {
            collectionId: collection.id,
        });
    };

    return (
        <TouchableHighlight
            onPress={navigateTo}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.container}>
                {collection.imageUrls[0] && (
                    <View style={styles.imageContainer}>
                        <Image
                            source={{uri: collection.imageUrls[0]}}
                            style={{
                                width: IMAGE_WIDTH,
                                height: IMAGE_WIDTH / IMAGE_RATIO,
                            }}
                        />
                    </View>
                )}

                <View style={styles.contentContainer}>
                    <View style={styles.leftColumn}>
                        <Text style={styles.titleText}>{collection.name}</Text>
                        <Text style={styles.subtitleText}>
                            {collection.productsAmount} product
                            {collection.productsAmount !== 1 && 's'}
                        </Text>
                    </View>

                    <View style={styles.rightColumn}>
                        <TouchableOpacity>
                            <SimpleLineIcons name="options" size={16} />
                        </TouchableOpacity>
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
        alignItems: 'center',
    },
    imageContainer: {},
    contentContainer: {
        marginLeft: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        flex: 1,
        height: '100%',
        paddingTop: 10,
    },
    leftColumn: {
        justifyContent: 'center',
    },
    rightColumn: {},
    titleText: {
        fontWeight: '500',
        fontSize: 15,
    },
    subtitleText: {},
});

export default CollectionListItem;
