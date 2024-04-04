import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, SxProps } from '@mui/material';
import { Canvas } from '../shared/canvas/canvas';
import { Draw } from '../shared/canvas/use-canvas';
import {
    RULER_HEIGHT_IN_PIXELS,
    RULER_TICK_HEIGHT_IN_PIXELS,
    RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS,
} from './constants';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';
import { TimelineTimecodeProps } from './timeline-ruler';

interface TimelineCanvasProps {
    canvasWidth: number;
    ticksForThisCanvas: TimelineTimecodeProps[];
    rulerUnitWidth: number;
    timecodeDisplayFrequencyInSeconds: number;
    sxProps: SxProps;
    rulerTickWidth: number;
}

export const TimelineCanvas = ({
    canvasWidth,
    ticksForThisCanvas: numberedCanvasTicks,
    rulerUnitWidth,
    timecodeDisplayFrequencyInSeconds,
    sxProps,
    rulerTickWidth,
}: TimelineCanvasProps) => {
    const drawCanvas: Draw = (context) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

        numberedCanvasTicks.forEach(({ currentSecond, label }, index) => {
            const tickX = index * rulerUnitWidth;

            if (!isNullOrUndefined(label)) {
                context.font = '12px Arial';

                context.fillText(
                    label,
                    tickX + 4,
                    RULER_HEIGHT_IN_PIXELS - RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS + 2
                );
            }

            const rulerTickHeight = isNullOrUndefined(label)
                ? RULER_TICK_HEIGHT_IN_PIXELS
                : RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS;

            const rulerTickY = isNullOrUndefined(label)
                ? RULER_HEIGHT_IN_PIXELS - RULER_TICK_HEIGHT_IN_PIXELS
                : RULER_HEIGHT_IN_PIXELS - RULER_TICK_WITH_NUMBER_HEIGHT_IN_PIXELS;

            context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
        });
    };

    return (
        <Box component="span" sx={{ position: 'relative' }}>
            <Canvas
                canvasId={`timeline-ruler`}
                draw={drawCanvas}
                width={canvasWidth}
                height={RULER_HEIGHT_IN_PIXELS}
                sxProps={sxProps}
            />
        </Box>
    );
};
