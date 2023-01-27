import React, {useEffect} from 'react';
import {
    Canvas,
    rect,
    FitBox,
    Box,
    BoxShadow,
    rrect,
    useComputedValue,
    mix,
    useValue,
    useTouchHandler,
    runTiming,
    Group,
    Skia,
    ImageSVG,
} from '@shopify/react-native-skia';
import {useAppSelector} from '@/store/hooks';
import {BUY_COLOR, DELETE_COLOR, PALETTE, SAVE_COLOR} from '@/constants';

const src = rect(0, 0, 24, 24);
const border = rrect(rect(0, 0, 24, 24), 5, 5);
const container = rrect(rect(1, 1, 22, 22), 5, 5);

interface ButtonProps {
    x: number;
    y: number;
    width: number;
    height: number;
    type: 'save' | 'buy' | 'delete';
}

const SkiaButton = ({x, y, width, height, type}: ButtonProps) => {
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
        if (action === type) {
            runTiming(pressed, 1, {duration: 150});
        } else {
            runTiming(pressed, 0, {duration: 150});
        }
    }, [action, pressed, type]);

    const c1 = useComputedValue(
        () => `rgba(63,98,18, ${mix(pressed.current, 0, 0.7)})`,
        [pressed],
    );

    const c2 = useComputedValue(() => {
        if (type === 'save') {
            return `rgba(54,83,20, ${mix(pressed.current, 0, 0.2)})`;
        } else if (type === 'buy') {
            return `rgba(185, 28, 28, ${mix(pressed.current, 0, 0.2)})`;
        } else {
            return `rgba(185, 28, 28, ${mix(pressed.current, 0, 0.2)})`;
        }
    }, [pressed]);

    const borderColor = useComputedValue(() => {
        let pressedColor: string;
        let unPressedColor: string;

        if (type === 'save') {
            pressedColor = PALETTE.lime[6];
            unPressedColor = PALETTE.lime[5];
        } else if (type === 'buy') {
            pressedColor = PALETTE.blue[6];
            unPressedColor = PALETTE.blue[5];
        } else {
            pressedColor = PALETTE.rose[6];
            unPressedColor = PALETTE.rose[5];
        }

        return pressed.current > 0 ? pressedColor : unPressedColor;
    }, [pressed]);

    const containerColor = useComputedValue(() => {
        let pressedColor: string;

        if (type === 'save') {
            pressedColor = PALETTE.lime[5];
        } else if (type === 'buy') {
            pressedColor = PALETTE.blue[5];
        } else {
            pressedColor = PALETTE.rose[5];
        }

        return pressed.current ? pressedColor : '#EEE';
    }, [pressed]);

    const firstBoxShadowCol = useComputedValue(
        () => (pressed.current > 0 ? PALETTE.lime[0] : '#fff'),
        [pressed],
    );

    const secondBoxShadowCol = useComputedValue(
        () => (pressed.current ? PALETTE.lime[1] : 'rgba(174, 174, 192, 0.4)'),
        [pressed],
    );

    const svg = useComputedValue(() => {
        if (type === 'save') {
            if (pressed.current > 0) {
                return Skia.SVG.MakeFromString(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                    <path fill="${PALETTE.neutral[0]}" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
                </svg>
            `)!;
            }

            return Skia.SVG.MakeFromString(`
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path fill="${SAVE_COLOR}" d="M47.6 300.4L228.3 469.1c7.5 7 17.4 10.9 27.7 10.9s20.2-3.9 27.7-10.9L464.4 300.4c30.4-28.3 47.6-68 47.6-109.5v-5.8c0-69.9-50.5-129.5-119.4-141C347 36.5 300.6 51.4 268 84L256 96 244 84c-32.6-32.6-79-47.5-124.6-39.9C50.5 55.6 0 115.2 0 185.1v5.8c0 41.5 17.2 81.2 47.6 109.5z"/>
            </svg>
        `)!;
        } else if (type === 'buy') {
            if (pressed.current > 0) {
                return Skia.SVG.MakeFromString(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                        <path fill="${PALETTE.neutral[0]}" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                    </svg>
                `)!;
            }

            return Skia.SVG.MakeFromString(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512">
                    <path fill="${BUY_COLOR}" d="M0 24C0 10.7 10.7 0 24 0H69.5c22 0 41.5 12.8 50.6 32h411c26.3 0 45.5 25 38.6 50.4l-41 152.3c-8.5 31.4-37 53.3-69.5 53.3H170.7l5.4 28.5c2.2 11.3 12.1 19.5 23.6 19.5H488c13.3 0 24 10.7 24 24s-10.7 24-24 24H199.7c-34.6 0-64.3-24.6-70.7-58.5L77.4 54.5c-.7-3.8-4-6.5-7.9-6.5H24C10.7 48 0 37.3 0 24zM128 464a48 48 0 1 1 96 0 48 48 0 1 1 -96 0zm336-48a48 48 0 1 1 0 96 48 48 0 1 1 0-96z"/>
                </svg>
            `)!;
        } else {
            if (pressed.current > 0) {
                return Skia.SVG.MakeFromString(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                        <path fill="${PALETTE.neutral[0]}" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
                    </svg>
                `)!;
            }

            return Skia.SVG.MakeFromString(`
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                    <path fill="${DELETE_COLOR}" d="M376.6 84.5c11.3-13.6 9.5-33.8-4.1-45.1s-33.8-9.5-45.1 4.1L192 206 56.6 43.5C45.3 29.9 25.1 28.1 11.5 39.4S-3.9 70.9 7.4 84.5L150.3 256 7.4 427.5c-11.3 13.6-9.5 33.8 4.1 45.1s33.8 9.5 45.1-4.1L192 306 327.4 468.5c11.3 13.6 31.5 15.4 45.1 4.1s15.4-31.5 4.1-45.1L233.7 256 376.6 84.5z"/>
                </svg>
            `)!;
        }
    }, [pressed]);

    return (
        <Canvas
            style={{
                flexBasis: width + 10,
                flexGrow: 0,
                flexShrink: 0,
                flex: 1,
                marginHorizontal: 10,
            }}
            onTouch={onTouch}>
            <FitBox src={src} dst={rect(x, y, width, height)}>
                <Box box={border} color={borderColor}>
                    <BoxShadow
                        dx={-1}
                        dy={-1}
                        blur={3}
                        color={firstBoxShadowCol}
                    />
                    <BoxShadow
                        dx={1}
                        dy={1}
                        blur={3}
                        color={secondBoxShadowCol}
                    />
                </Box>
                <Box box={container} color={containerColor}>
                    <BoxShadow dx={-1} dy={-1} blur={1} color={c1} inner />
                    <BoxShadow dx={1.5} dy={1.5} blur={3} color={c2} inner />
                </Box>
            </FitBox>
            <Group color={PALETTE.lime[6]}>
                <ImageSVG
                    svg={svg}
                    x={x + width / 4}
                    y={y + width / 4}
                    width={width / 2}
                    height={height / 2}
                />
            </Group>
        </Canvas>
    );
};

export default SkiaButton;
