import { Box, SxProps } from '@mui/material';
import { asFormattedMediaTimecodeString } from '../shared/as-formatted-media-timecode-string';
import { Canvas } from '../shared/canvas/canvas';
import { Draw } from '../shared/canvas/use-canvas';
import { RULER_HEIGHT, RULER_TICK_HEIGHT, RULER_TICK_WITH_NUMBER_HEIGHT } from './constants';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';

interface TimelineCanvasProps {
    canvasWidth: number;
    numberedCanvasTicks: number[];
    rulerUnitWidth: number;
    rulerTickFrequencyInSeconds: number;
    numberFrequencyInSeconds: number;
    sxProps: SxProps;
    rulerTickWidth: number;
}

export const TimelineCanvas = ({
    canvasWidth,
    numberedCanvasTicks,
    rulerUnitWidth,
    rulerTickFrequencyInSeconds,
    numberFrequencyInSeconds,
    sxProps,
    rulerTickWidth,
}: TimelineCanvasProps) => {
    const drawCanvas: Draw = (context) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

        numberedCanvasTicks.forEach((tick, index) => {
            if (tick % rulerTickFrequencyInSeconds !== 0) return;

            const tickX = index * rulerUnitWidth;

            if (tick % numberFrequencyInSeconds === 0) {
                const timeCode = asFormattedMediaTimecodeString(tick);

                context.font = '12px Arial';

                context.fillText(
                    timeCode,
                    tickX + 4,
                    RULER_HEIGHT - RULER_TICK_WITH_NUMBER_HEIGHT + 2
                );
            }

            const rulerTickHeight =
                tick % numberFrequencyInSeconds === 0
                    ? RULER_TICK_WITH_NUMBER_HEIGHT
                    : RULER_TICK_HEIGHT;

            const rulerTickY =
                tick % numberFrequencyInSeconds === 0
                    ? RULER_HEIGHT - RULER_TICK_WITH_NUMBER_HEIGHT
                    : RULER_HEIGHT - RULER_TICK_HEIGHT;

            context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
        });
    };

    return (
        <Box component="span" sx={{ position: 'relative' }}>
            <Canvas
                canvasId={`timeline-ruler`}
                draw={drawCanvas}
                width={canvasWidth}
                height={RULER_HEIGHT}
                sxProps={sxProps}
            />
        </Box>
    );
};
