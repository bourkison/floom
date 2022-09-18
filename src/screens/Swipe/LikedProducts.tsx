import React from 'react';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';
import {SafeAreaView, Text} from 'react-native';

const LikedProducts = ({
    navigation,
}: StackScreenProps<MainStackParamList, 'LikedProducts'>) => {
    return (
        <SafeAreaView>
            <Text>Liked Products</Text>
        </SafeAreaView>
    );
};

export default LikedProducts;
