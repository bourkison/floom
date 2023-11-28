import React from 'react';
import {View, Text, StyleSheet, Image, TouchableHighlight} from 'react-native';

import {PALETTE} from '@/constants';
import {CollectionType} from '@/context/saved';

type CollectionListItemSmallProps = {
    collection: CollectionType;
    onPress: (id: number) => void;
};

const IMAGE_DIAMETER = 60;

const TOUCHABLE_UNDERLAY = PALETTE.neutral[1];
const TOUCHABLE_ACTIVE_OPACITY = 0.8;

const CollectionListItemSmall = ({
    collection,
    onPress,
}: CollectionListItemSmallProps) => {
    return (
        <TouchableHighlight
            onPress={() => onPress(collection.id)}
            underlayColor={TOUCHABLE_UNDERLAY}
            activeOpacity={TOUCHABLE_ACTIVE_OPACITY}>
            <View style={styles.container}>
                <View style={styles.imageContainer}>
                    {collection.imageUrls[0] ? (
                        <Image
                            source={{uri: collection.imageUrls[0]}}
                            style={styles.image}
                        />
                    ) : (
                        <View style={[styles.image, styles.placeholderImage]} />
                    )}
                </View>

                <View style={styles.textContainer}>
                    <Text>{collection.name}</Text>
                </View>
            </View>
        </TouchableHighlight>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 10,
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        borderColor: PALETTE.neutral[2],
    },
    imageContainer: {},
    image: {
        width: IMAGE_DIAMETER,
        height: IMAGE_DIAMETER,
        borderRadius: IMAGE_DIAMETER / 2,
    },
    placeholderImage: {
        backgroundColor: PALETTE.neutral[2],
    },
    textContainer: {
        marginLeft: 10,
    },
});

export default CollectionListItemSmall;
