import React, {useState} from 'react';
import ProductList from '@/components/Product/ProductList';
import {View, StyleSheet, useWindowDimensions} from 'react-native';
import ActionButton from '@/components/Utility/ActionButton';

import {StackScreenProps} from '@react-navigation/stack';
import {MainStackParamList} from '@/nav/Navigator';

import {IMAGE_RATIO, IMAGE_PADDING} from '@/constants';
import FilterDropdown from '@/components/Product/FilterDropdown';

const Home = ({}: StackScreenProps<MainStackParamList, 'Home'>) => {
    const {width} = useWindowDimensions();

    const [selectedGenders, setSelectedGenders] = useState<string[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [selectedColours, setSelectedColours] = useState<string[]>([]);

    const toggleFilter = (
        item: string,
        type: 'gender' | 'category' | 'color',
    ) => {
        if (type === 'gender') {
            if (!selectedGenders.includes(item)) {
                setSelectedGenders([...selectedGenders, item]);
            } else {
                setSelectedGenders(g => g.filter(i => i !== item));
            }
        } else if (type === 'category') {
            if (!selectedCategories.includes(item)) {
                setSelectedCategories([...selectedCategories, item]);
            } else {
                setSelectedCategories(c => c.filter(i => i !== item));
            }
        } else if (type === 'color') {
            if (!selectedColours.includes(item)) {
                setSelectedColours([...selectedColours, item]);
            } else {
                setSelectedColours(c => c.filter(i => i !== item));
            }
        }
    };

    return (
        <View style={styles.flexOne}>
            <FilterDropdown
                selectedGenders={selectedGenders}
                selectedCategories={selectedCategories}
                selectedColours={selectedColours}
                toggleItem={toggleFilter}
            />
            <View style={styles.container}>
                <View
                    style={[
                        styles.productContainer,
                        {flexBasis: (width - IMAGE_PADDING) / IMAGE_RATIO},
                    ]}>
                    <ProductList />
                </View>
                <View style={styles.buttonsContainer}>
                    <ActionButton
                        type="delete"
                        radius={50}
                        style={styles.button}
                    />
                    <ActionButton
                        type="buy"
                        radius={50}
                        style={styles.button}
                    />
                    <ActionButton
                        type="save"
                        radius={50}
                        style={styles.button}
                    />
                </View>
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
    productContainer: {
        flex: 1,
        flexGrow: 0,
        flexShrink: 0,
    },
    buttonsContainer: {
        marginTop: 40,
        flexDirection: 'row',
    },
    button: {
        marginHorizontal: 10,
    },
    flexOne: {flex: 1},
});

export default Home;
