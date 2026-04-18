import React, { forwardRef, useEffect, useImperativeHandle, useLayoutEffect, useRef, useState } from 'react';
import { StyleSheet, ImageBackground, View } from 'react-native';
import { Pawn, PawnData, PawnHandle, PawnProps } from './Pawn';

export type BoardProps = any;

export type BoardHandle = {
    getFieldWidth: () => number;
    getPawnHandle: (id: number) => PawnHandle | undefined;
    addPawn: (props: PawnData, callback?: (handle: PawnHandle) => void) => void;
};

export const Board = forwardRef<BoardHandle, BoardProps>((p, ref) => {
    const [fieldWidth, setFieldWidth] = useState(0);
    const [position, setPosition] = useState({x: 0, y: 0});
    const [pawns, setPawns] = useState<PawnProps[]>([]);
    const fieldWidthRef = useRef(0);
    const positionRef = useRef({x: 0, y: 0});
    const pawnRefs = useRef(new Map<number, PawnHandle>);
    const postRenderQueue = useRef<(() => void)[]>([]);

    useLayoutEffect(() => {
        postRenderQueue.current.forEach((cb) => cb());
        postRenderQueue.current = [];
    });
    useEffect(() => {
        fieldWidthRef.current = fieldWidth;
    }, [fieldWidth])
    useEffect(() => {
        positionRef.current = position;
    }, [position])

    useImperativeHandle(ref, () => ({
        getFieldWidth: () => { return fieldWidthRef.current; },
        getPawnHandle: (id) => {
            return pawnRefs.current.get(id);
        },
        addPawn: (pawn, callback) => {
            const x = fieldWidthRef.current*7;
            const y = fieldWidthRef.current*7;
            const pawnProps: PawnProps = {initialFieldWidth: fieldWidthRef.current, initialPosition: {x: x, y: y}, id: pawn.id, color: pawn.color}
            setPawns((prev) => [...prev, pawnProps]);
            if (callback) {
                postRenderQueue.current.push(() => {
                    const handle = pawnRefs.current.get(pawn.id);
                    handle?.setFieldWidth(fieldWidth);
                    if (handle) callback(handle);
                });
            }
        }
    }));

    return (
        <View style={styles.container}>
            <ImageBackground style={styles.background} source={require('../../assets/img/ludo-board.jpg')} onLayout={(event) => {
                const fw = event.nativeEvent.layout.width / 15;
                if (fw == 0) return;
                setFieldWidth(fw);
                let x = event.nativeEvent.layout.x;
                let y = event.nativeEvent.layout.y;
                setPosition({x: x, y: y});
            }}>
                {pawns.map((pawn) => (
                    <Pawn
                        key={pawn.id}
                        {...pawn}
                        ref={(instance) => {
                            if (instance) {
                                pawnRefs.current.set(pawn.id, instance);
                            } else {
                                pawnRefs.current.delete(pawn.id);
                            }
                        }}
                    />
                ))}
            </ImageBackground>
        </View>
    );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
    position: 'relative',
  },
  background: {
    flex: 1,
    aspectRatio: 1,
    position: 'relative',
  },
});