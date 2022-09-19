import React, {useEffect} from 'react';
import {View, Text} from 'react-native';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

const ProductView = ({
    route,
}: StackScreenProps<MainStackParamList, 'ProductView'>) => {
    return (
        <View>
            <Text>{route.params.product.title}</Text>
        </View>
    );
};

export default ProductView;
