import React, {useEffect} from 'react';
import {View, Text, Image, StyleSheet, useWindowDimensions} from 'react-native';

import {IMAGE_RATIO, PALETTE} from '@/constants';
import {Database} from '@/types/schema';

type SaveListItemProps = {
    save: Database['public']['Views']['v_saves']['Row'];
};

const IMAGE_WIDTH_RATIO = 0.25;

const SaveListItem = ({save}: SaveListItemProps) => {
    const {width} = useWindowDimensions();
    const IMAGE_WIDTH = width * IMAGE_WIDTH_RATIO;

    useEffect(() => {
        console.log('images', save.images);
    }, [save]);

    return (
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
                <Text style={styles.titleText}>{save.name}</Text>
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

export default SaveListItem;
