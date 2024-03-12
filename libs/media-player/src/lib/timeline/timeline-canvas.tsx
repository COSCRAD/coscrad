import { Box, SxProps } from '@mui/material';
import { Canvas } from '../shared/canvas/canvas';
import { Draw } from '../shared/canvas/use-canvas';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';

interface TimelineCanvasProps {
    canvasWidth: number;
    ticksPerCanvas: number;
    rulerTickXCoordinateOffset: number;
    rulerTickFrequencyInSeconds: number;
    sxProps: SxProps;
    rulerHeight: number;
    rulerTickY: number;
    rulerTickWidth: number;
    rulerTickHeight: number;
}

export const TimelineCanvas = ({
    canvasWidth,
    ticksPerCanvas,
    rulerTickXCoordinateOffset,
    rulerTickFrequencyInSeconds,
    sxProps,
    rulerHeight,
    rulerTickY,
    rulerTickWidth,
    rulerTickHeight,
}: TimelineCanvasProps) => {
    const rulerTicks = [...Array(ticksPerCanvas).keys()];

    const drawCanvas: Draw = (context) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

        rulerTicks.forEach((tick, index) => {
            if (index % rulerTickFrequencyInSeconds !== 0) return;

            const tickX = tick * rulerTickXCoordinateOffset;

            context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
        });
    };

    return (
        <Box component="span" sx={{ border: '1px solid red', float: 'left', position: 'relative' }}>
            <Canvas
                canvasId={`timeline-ruler`}
                draw={drawCanvas}
                width={canvasWidth}
                height={rulerHeight}
                sxProps={sxProps}
            />
        </Box>
    );
};
