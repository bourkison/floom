import React, {useCallback, useLayoutEffect, useMemo} from 'react';
import {
    View,
    Text,
    StyleSheet,
    useWindowDimensions,
    Pressable,
} from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from 'react-native-reanimated';

import {PALETTE} from '@/constants';

type TabsProps = {
    pages: {header: string; content: React.JSX.Element}[];
    onTabChange: (toIndex: number, fromIndex: number) => void;
    activeTabIndex: number;
};

const CHASER_INSET = 25;

const Tabs = ({pages, onTabChange, activeTabIndex}: TabsProps) => {
    const translateX = useSharedValue(CHASER_INSET);

    const {width} = useWindowDimensions();

    const chaserWidth = useMemo(
        () => width / pages.length - CHASER_INSET * 2,
        [width, pages],
    );

    const calculateChaserPosition = useCallback(
        (toIndex: number): number => {
            const sectionWidth = width / pages.length;
            return sectionWidth * toIndex + CHASER_INSET;
        },
        [width, pages],
    );

    // useLayoutEffect so animationsEnabled has had a chance to render in.
    useLayoutEffect(() => {
        translateX.value = withSpring(calculateChaserPosition(activeTabIndex));
    }, [activeTabIndex, translateX, calculateChaserPosition]);

    const changeTab = (toIndex: number) => {
        if (activeTabIndex === toIndex) {
            return;
        }

        onTabChange(toIndex, activeTabIndex);
    };

    const rChaserStyle = useAnimatedStyle(() => {
        return {
            transform: [{translateX: translateX.value}],
        };
    });

    return (
        <View style={styles.container}>
            <View style={styles.headerParent}>
                {pages.map((tab, index) => (
                    <Pressable
                        key={index}
                        style={styles.headerContainer}
                        onPress={() => changeTab(index)}>
                        <Text>{tab.header}</Text>
                    </Pressable>
                ))}
            </View>
            <Animated.View
                style={[
                    styles.chaser,
                    {
                        width: chaserWidth,
                    },
                    rChaserStyle,
                ]}
            />

            {pages[activeTabIndex].content}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerParent: {
        flexDirection: 'row',
        paddingVertical: 15,
        backgroundColor: '#FFF',
    },
    headerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    borderRight: {
        borderRightWidth: 1,
    },
    chaser: {
        height: 3,
        backgroundColor: PALETTE.neutral[8],
    },
    contentContainer: {
        flex: 1,
    },
});

export default Tabs;
