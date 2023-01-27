import React, {useEffect} from 'react';
import {
    Canvas,
    rect,
    FitBox,
    Box,
    BoxShadow,
    rrect,
    Fill,
    useComputedValue,
    mix,
    useValue,
    useTouchHandler,
    runTiming,
} from '@shopify/react-native-skia';
import {useAppSelector} from '@/store/hooks';

const src = rect(0, 0, 24, 24);
const border = rrect(rect(0, 0, 24, 24), 5, 5);
const container = rrect(rect(1, 1, 22, 22), 5, 5);

interface ButtonProps {
    x: number;
    y: number;
    width: number;
    height: number;
}

const SkiaButton = ({x, y, width, height}: ButtonProps) => {
    const action = useAppSelector(state => state.product.action);

    const pressed = useValue(0);

    const onTouch = useTouchHandler({
        onStart: () => {
            console.log('TOUCH');
            runTiming(pressed, 1, {duration: 150});
        },
        onEnd: () => {
            console.log('FINISH');
            runTiming(pressed, 0, {duration: 150});
        },
    });

    useEffect(() => {
        if (action === 'save') {
            runTiming(pressed, 1, {duration: 150});
        } else {
            runTiming(pressed, 0, {duration: 150});
        }
    }, [action, pressed]);

    const c1 = useComputedValue(
        () => `rgba(255, 255, 255, ${mix(pressed.current, 0, 0.7)})`,
        [pressed],
    );

    const c2 = useComputedValue(
        () => `rgba(174, 174, 192, ${mix(pressed.current, 0, 0.2)})`,
        [pressed],
    );

    return (
        <Canvas style={{flex: 1}} onTouch={onTouch}>
            <Fill color={'#f0f0f3'} />
            <FitBox src={src} dst={rect(x, y, width, height)}>
                <Box box={border} color={'#EEE'}>
                    <BoxShadow dx={-1} dy={-1} blur={3} color="white" />
                    <BoxShadow
                        dx={1}
                        dy={1}
                        blur={3}
                        color="rgba(174, 174, 192, 0.4)"
                    />
                </Box>
                <Box box={container} color={'#EEE'}>
                    <BoxShadow dx={-1} dy={-1} blur={1} color={c1} inner />
                    <BoxShadow dx={1.5} dy={1.5} blur={3} color={c2} inner />
                </Box>
            </FitBox>
        </Canvas>
    );
};

export default SkiaButton;
