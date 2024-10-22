import { useEffect, useRef } from 'react';
import { isNullOrUndefined } from '../shared/validation';

export type Draw = (context: CanvasRenderingContext2D) => void;

/**
 * Source: https://github.com/felerticia/canvas-react/blob/main/src/Canvas/useCanvas.js
 */
export const useCanvas = (draw: Draw) => {
    const ref = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = ref.current;

        if (isNullOrUndefined(canvas)) return;

        const context = canvas.getContext('2d');

        if (isNullOrUndefined(context)) return;

        const renderer = () => {
            draw(context);
        };

        renderer();
    }, [draw]);

    return ref;
};
