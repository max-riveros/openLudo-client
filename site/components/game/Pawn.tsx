import React, { createContext, forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StyleSheet, Animated } from 'react-native';

export type PawnHandle = {
    setFieldWidth: (value: number) => void;
    getId: () => number;
    getX: () => number;
    getY: () => number;
    move: (up: number, left: number, fast: boolean) => Promise<void>;
    moveDown: (times: number, fast: boolean) => Promise<void>;
    moveRight: (times: number, fast: boolean) => Promise<void>;
};

export type Color = "red" | "blue" | "green" | "yellow"

export type PawnData = {
    id: number,
    color: Color,
    startPosition?: number,
    endPosition?: number,
}
export type PawnProps = {
    initialFieldWidth: number;
    initialPosition: {x: number, y: number};
} & PawnData;

export const Pawn = forwardRef<PawnHandle, PawnProps>(({ id, initialFieldWidth = 1, initialPosition = {x: 0, y: 0} }, ref) => {
    const [x, setX] = useState(initialPosition.x);
    const [y, setY] = useState(initialPosition.y);
    const [fieldWidth, setFieldWidth] = useState(initialFieldWidth);
    const xRef = useRef(initialPosition.x);
    const yRef = useRef(initialPosition.y);

    const transAnim = useRef(new Animated.ValueXY({ x: initialPosition.x, y: initialPosition.y })).current;

    const toFieldPos = (x: number) => {
        return Math.round(x/fieldWidth * 100) / 100; // Round to 100th decimal place
    }

    useEffect(() => {
        yRef.current = y;
    }, [y])

    useEffect(() => {
        xRef.current = x;
    }, [x])

    const createSpringAnim = (x: number, y: number) => {
            return Animated.spring(transAnim, {
                toValue: {x: x, y: y},
                useNativeDriver: true,
                speed: 500,
            });
    };
    const createTimingAnim = (x: number, y: number) => {
            return Animated.timing(transAnim, {
                toValue: {x: x, y: y},
                useNativeDriver: true,
                duration: 40,
            });
    };

    useImperativeHandle(ref, () => ({
        setFieldWidth: (value) => setFieldWidth(value),
        getId: () => { return id },
        getX: () => { return toFieldPos(xRef.current) },
        getY: () => { return toFieldPos(yRef.current) },
        move: async (up, left, fast) => {
            const newY = yRef.current - fieldWidth*up;
            const newX = xRef.current - fieldWidth*left;
            setY(newY);
            setX(newX);

            let anim = fast? createTimingAnim(newX, newY) : createSpringAnim(newX, newY);
            return new Promise(resolve => anim.start(() => resolve()));
        },
        moveDown: async (times, fast) => {
            const newY = yRef.current + fieldWidth*times;

            setY(newY);
            let anim = fast? createTimingAnim(xRef.current, newY) : createSpringAnim(xRef.current, newY);
            return new Promise(resolve => anim.start(() => resolve()));
        },
        moveRight: async (times, fast) => {
            const newX = xRef.current + fieldWidth*times;

            setX(newX);
            let anim = fast? createTimingAnim(newX, yRef.current) : createSpringAnim(newX, yRef.current);
            return new Promise(resolve => anim.start(() => resolve()));
        }
    }));

    return (
        <Animated.Image 
            source={require('../../assets/img/pawn.png')} 
            style={[ styles.pawn, 
                    { transform: [ 
                        { translateX: transAnim.x },
                        { translateY: transAnim.y },
                    ]},
                    { width: initialFieldWidth },
                    { height: initialFieldWidth },
            ]}
        />
    );
});

const styles = StyleSheet.create({
  pawn: {
    aspectRatio: 1,
    position: 'absolute',
    left: 0,
    top: 0,
  },
});