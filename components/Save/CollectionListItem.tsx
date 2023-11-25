import React, {useEffect, useState} from 'react';
import {View, Text, StyleSheet, useWindowDimensions, Image} from 'react-native';

import {IMAGE_RATIO, PALETTE} from '@/constants';
import {CollectionType} from '@/screens/Saved/SavedHome';

type CollectionListItemProps = {
    collection: CollectionType;
};

const IMAGE_WIDTH_RATIO = 0.25;

const CollectionListItem = ({collection}: CollectionListItemProps) => {
    const {width} = useWindowDimensions();
    const IMAGE_WIDTH = width * IMAGE_WIDTH_RATIO;

    const [imageUrl, setImageUrl] = useState('');

    // Set image url to use on load
    useEffect(() => {
        for (let i = 0; i < collection.products.length; i++) {
            const product = collection.products[i];

            if (product.images && product.images[0]) {
                setImageUrl(product.images[0]);
                return;
            }
        }
    }, [collection]);

    return (
        <View style={styles.container}>
            <View style={styles.imageContainer}>
                <Image
                    source={{uri: imageUrl}}
                    style={{
                        width: IMAGE_WIDTH,
                        height: IMAGE_WIDTH / IMAGE_RATIO,
                    }}
                />
            </View>
            <View style={styles.contentContainer}>
                <Text style={styles.titleText}>{collection.name}</Text>
                <Text style={styles.subtitleText}>
                    {collection.products.length} product
                    {collection.products.length !== 1 && 's'}
                </Text>
            </View>
        </View>
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
    },
    titleText: {
        fontWeight: '500',
        fontSize: 15,
    },
    subtitleText: {},
});

export default CollectionListItem;
