import React from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, Text} from 'react-native';
import ActionButton from '@/components/Utility/ActionButton';
import {useWindowDimensions} from 'react-native';

const IMAGE_RATIO = 0.9;
const IMAGE_PADDING = 40;

const Swipe = () => {
    const {width} = useWindowDimensions();
    return (
        <View style={styles.container}>
            <View
                style={{
                    flex: 1,
                    flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO,
                    flexGrow: 0,
                    flexShrink: 0,
                }}
                onLayout={e => {
                    console.log('LAYOUT', e.nativeEvent.layout);
                }}>
                <ProductList />
            </View>
            {/* <View style={styles.buttonsContainer}>
                <ActionButton type="save" radius={50} />
            </View> */}
            <View style={{flex: 1}}>
                <Text>TEST TEST</Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        paddingTop: 20,
        flex: 1,
        alignItems: 'center',
        alignContent: 'center',
    },
    buttonsContainer: {
        marginTop: 40,
    },
});

export default Swipe;
