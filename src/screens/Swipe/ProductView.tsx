import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Pressable,
    ImageBackground,
    useWindowDimensions,
    ViewStyle,
    ScrollView,
} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO} from '@/constants';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    const [imageIndex, setImageIndex] = useState(0);
    const {width} = useWindowDimensions();

    useEffect(() => {
        console.log(route.params.product);
    }, []);

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

        if (i === route.params.product.imageLink.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} contentContainerStyle={{flex: 1}}>
                <View
                    style={
                        (styles.imageContainer,
                        {flexBasis: width / IMAGE_RATIO})
                    }>
                    <ImageBackground
                        style={styles.imageContainerStyle}
                        source={{
                            uri: route.params.product.imageLink[imageIndex],
                        }}>
                        <View style={styles.selectedImageContainer}>
                            {route.params.product.imageLink.map((s, index) => (
                                <View
                                    style={calculateImageIndicator(index)}
                                    key={index}
                                />
                            ))}
                        </View>
                    </ImageBackground>
                </View>
                <View style={styles.contentContainer}>
                    <Text style={styles.title}>
                        {route.params.product.title}
                    </Text>
                </View>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3fcfa',
    },
    imageContainer: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
    },
    imageContainerStyle: {
        flex: 1,
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
    contentContainer: {
        flex: 1,
    },
    title: {
        fontSize: 22,
        fontWeight: '500',
    },
});

export default ProductView;
