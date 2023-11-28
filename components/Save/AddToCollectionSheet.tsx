import {AntDesign} from '@expo/vector-icons';
import React, {useEffect, useLayoutEffect, useState} from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import Animated, {
    FadeIn,
    FadeOut,
    SlideInLeft,
    SlideInRight,
    SlideOutLeft,
    SlideOutRight,
} from 'react-native-reanimated';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import CollectionListItemSmall from '@/components/Save/CollectionListItemSmall';
import AnimatedButton from '@/components/Utility/AnimatedButton';
import {PALETTE} from '@/constants';
import {useBottomSheetContext} from '@/context/BottomSheet';
import {useSharedSavedContext} from '@/context/saved';
import {Database} from '@/types/schema';

type AddToCollectionBottomSheetProps = {
    selectedSaves: Database['public']['Views']['v_saves']['Row'][];
    onSelect: () => void;
};

const AddToCollectionBottomSheet = ({
    selectedSaves,
    onSelect,
}: AddToCollectionBottomSheetProps) => {
    const [activePage, setActivePage] = useState<'select' | 'create'>('select');
    const [isLoadingCollections, setIsLoadingCollections] = useState(false);
    const [skipEnterAnimation, setSkipEnterAnimation] = useState(true);

    const [name, setName] = useState('');
    const [isCreating, setIsCreating] = useState(false);

    useLayoutEffect(() => setSkipEnterAnimation(false), []);

    const {closeBottomSheet} = useBottomSheetContext();
    const {
        hasInitiallyLoadedCollections,
        initFetchCollections,
        collections,
        addSavesToCollection,
        createCollection,
    } = useSharedSavedContext();

    const {bottom} = useSafeAreaInsets();

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

    const create = async () => {
        setIsCreating(true);

        await createCollection({name}, selectedSaves);

        setIsCreating(false);
        onSelect();
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                {activePage === 'select' ? (
                    <TouchableOpacity
                        style={[styles.column, styles.sideColumn]}
                        onPress={closeBottomSheet}>
                        <Text>Cancel</Text>
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        style={[styles.column, styles.sideColumn]}
                        onPress={() => setActivePage('select')}>
                        <Text>Back</Text>
                    </TouchableOpacity>
                )}

                <View style={styles.column}>
                    <Text style={styles.headerText}>Add to Collection</Text>
                </View>

                <TouchableOpacity
                    onPress={() => setActivePage('create')}
                    style={[
                        styles.column,
                        styles.sideColumn,
                        styles.rightColumn,
                    ]}>
                    {activePage === 'select' && (
                        <Animated.View
                            exiting={FadeOut.duration(100)}
                            entering={FadeIn.duration(100)}>
                            <AntDesign name="plus" size={18} />
                        </Animated.View>
                    )}
                </TouchableOpacity>
            </View>

            {activePage === 'select' && (
                <Animated.View
                    entering={!skipEnterAnimation ? SlideInLeft : undefined}
                    exiting={SlideOutLeft}>
                    {!isLoadingCollections ? (
                        <ScrollView
                            style={styles.contentContainer}
                            contentContainerStyle={{paddingBottom: bottom}}>
                            {collections.map(collection => (
                                <CollectionListItemSmall
                                    key={collection.id}
                                    collection={collection}
                                    onPress={id => {
                                        addSavesToCollection(selectedSaves, id);
                                        onSelect();
                                    }}
                                />
                            ))}
                        </ScrollView>
                    ) : (
                        <ActivityIndicator style={styles.activityIndicator} />
                    )}
                </Animated.View>
            )}

            {activePage === 'create' && (
                <Animated.View entering={SlideInRight} exiting={SlideOutRight}>
                    <View style={styles.collectionInputContainer}>
                        <Text style={styles.titleText}>Collection Name</Text>

                        <TextInput
                            onChangeText={setName}
                            style={styles.textInput}
                            value={name}
                            returnKeyType="default"
                        />

                        <Text style={styles.hintText}>
                            Collections are a great way to organise products you
                            want, and to build out mood boards!
                        </Text>
                    </View>

                    <View style={styles.buttonContainer}>
                        <AnimatedButton
                            style={styles.createButton}
                            textStyle={styles.createButtonText}
                            onPress={create}
                            disabled={isCreating}>
                            {isCreating ? (
                                <ActivityIndicator size={14} />
                            ) : (
                                'Create Collection'
                            )}
                        </AnimatedButton>
                    </View>
                </Animated.View>
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
    textInput: {
        paddingVertical: 10,
        paddingHorizontal: 8,
        borderColor: PALETTE.neutral[9],
        borderBottomWidth: 3,
        marginTop: 10,
    },
    hintText: {
        fontSize: 12,
        color: PALETTE.neutral[5],
        fontWeight: '300',
        marginTop: 10,
    },
    collectionInputContainer: {
        paddingHorizontal: 25,
        marginTop: 30,
    },
    titleText: {
        fontSize: 12,
        fontWeight: '500',
    },
    buttonContainer: {
        paddingHorizontal: 30,
        marginTop: 20,
    },
    createButton: {
        padding: 7,
        backgroundColor: PALETTE.neutral[8],
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10,
        width: '100%',
        alignSelf: 'center',
        marginLeft: 10,
        shadowColor: '#1a1f25',
        shadowOffset: {
            height: 0,
            width: 0,
        },
        shadowOpacity: 0.3,
    },
    createButtonText: {
        color: PALETTE.gray[1],
        fontSize: 12,
        fontWeight: 'bold',
        textAlign: 'center',
        flexBasis: 14,
        flexShrink: 0,
        flexGrow: 0,
    },
});

export default AddToCollectionBottomSheet;
