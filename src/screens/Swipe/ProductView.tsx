import React, {useState} from 'react';
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

import * as Haptics from 'expo-haptics';

import {IMAGE_RATIO} from '@/constants';
import {FontAwesome5} from '@expo/vector-icons';
import AnimatedButton from '@/components/Utility/AnimatedButton';

const ProductView = ({
    route,
    navigation,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    const [imageIndex, setImageIndex] = useState(0);
    const {width} = useWindowDimensions();

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

        if (i === route.params.product.images.length - 1) {
            style.marginRight = 0;
        }

        return style;
    };

    const changeImage = (amount: number) => {
        if (amount < 0 && imageIndex + amount >= 0) {
            setImageIndex(imageIndex + amount);
            Haptics.selectionAsync();
            return;
        }

        if (
            amount > 0 &&
            imageIndex + amount <= route.params.product.images.length - 1
        ) {
            setImageIndex(imageIndex + amount);
            Haptics.selectionAsync();
            return;
        }
    };

    const goBack = () => {
        Haptics.selectionAsync();
        navigation.pop();
    };

    return (
        <View style={styles.container}>
            <ScrollView bounces={false} contentContainerStyle={styles.flexOne}>
                <View
                    style={
                        (styles.imageContainer,
                        {flexBasis: width / IMAGE_RATIO})
                    }>
                    <ImageBackground
                        style={styles.imageContainerStyle}
                        source={{
                            uri: route.params.product.images[imageIndex],
                        }}>
                        <View style={styles.selectedImageContainer}>
                            {route.params.product.images.map((s, index) => (
                                <View
                                    style={calculateImageIndicator(index)}
                                    key={index}
                                />
                            ))}
                        </View>
                        <View style={styles.imagePressableContainer}>
                            <Pressable
                                style={styles.flexOne}
                                onPress={() => {
                                    changeImage(-1);
                                }}
                            />
                            <View style={styles.imageNonPressable} />
                            <Pressable
                                style={styles.flexOne}
                                onPress={() => {
                                    changeImage(1);
                                }}
                            />
                        </View>
                    </ImageBackground>
                </View>
                <View style={styles.contentContainer}>
                    <View style={styles.titleButtonContainer}>
                        <View style={styles.flexOne}>
                            <Text style={styles.title}>
                                {route.params.product.name}
                            </Text>
                        </View>
                        <View style={styles.downButtonContainer}>
                            <AnimatedButton
                                onPress={goBack}
                                style={styles.downButton}>
                                <FontAwesome5
                                    name="long-arrow-alt-down"
                                    size={36}
                                    color="#f3fcfa"
                                />
                            </AnimatedButton>
                        </View>
                    </View>
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
    downButtonContainer: {
        flex: 1,
        flexBasis: 48,
        flexGrow: 0,
        flexShrink: 0,
        marginTop: -24,
        marginRight: 24,
    },
    downButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: '#1a1f25',
        alignContent: 'center',
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePressableContainer: {flex: 1, flexDirection: 'row'},
    imageNonPressable: {flex: 3},
    flexOne: {
        flex: 1,
    },
    titleButtonContainer: {
        flex: 1,
        flexDirection: 'row',
    },
});

export default ProductView;
