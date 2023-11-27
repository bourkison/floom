import {AntDesign} from '@expo/vector-icons';
import React, {useEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';

import {PALETTE} from '@/constants';
import {useBottomSheetContext} from '@/context/BottomSheet';
import {useSharedSavedContext} from '@/context/saved';

const AddToCollectionBottomSheet = () => {
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);

    const {closeBottomSheet} = useBottomSheetContext();
    const {hasInitiallyLoadedCollections, initFetchCollections} =
        useSharedSavedContext();

    useEffect(() => {
        const fetchCollections = async () => {
            setIsLoadingCollections(true);
            await initFetchCollections();
            setIsLoadingCollections(false);
        };
        if (!hasInitiallyLoadedCollections) {
            fetchCollections();
        }
    }, [hasInitiallyLoadedCollections, initFetchCollections]);

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity
                    style={[styles.column, styles.sideColumn]}
                    onPress={closeBottomSheet}>
                    <Text>Cancel</Text>
                </TouchableOpacity>

                <View style={styles.column}>
                    <Text style={styles.headerText}>Add to Collection</Text>
                </View>

                <TouchableOpacity
                    onPress={() => console.log('NEW')}
                    style={[
                        styles.column,
                        styles.sideColumn,
                        styles.rightColumn,
                    ]}>
                    <AntDesign name="plus" size={18} />
                </TouchableOpacity>
            </View>

            {!isLoadingCollections ? (
                <ScrollView style={styles.contentContainer}>
                    <Text>Content</Text>
                </ScrollView>
            ) : (
                <ActivityIndicator style={styles.activityIndicator} />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        shadowColor: PALETTE.neutral[9],
        shadowOpacity: 0.3,
        shadowOffset: {
            width: 0,
            height: 0,
        },
        width: '100%',
        height: '100%',
        flex: 1,
        backgroundColor: '#FFF',
    },
    column: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sideColumn: {
        flexBasis: 60,
        flexGrow: 0,
        flexShrink: 0,
        alignItems: 'flex-start',
    },
    rightColumn: {
        alignItems: 'flex-end',
    },
    header: {
        flexDirection: 'row',
        backgroundColor: '#FFF',
        borderColor: PALETTE.neutral[2],
        borderTopWidth: 1,
        borderBottomWidth: 1,
        justifyContent: 'space-between',
        paddingVertical: 18,
        paddingHorizontal: 15,
    },
    headerText: {
        fontSize: 16,
        fontWeight: '500',
    },
    contentContainer: {},
    activityIndicator: {
        marginTop: 25,
    },
});

export default AddToCollectionBottomSheet;
