import { Box } from '@mui/material';
import { RULER_TICK_WIDTH, ZOOM_LEVELS } from './constants';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';
import { TimelineCanvas } from './timeline-canvas';

/**
 * This limitation is from the IE 9 / 10 (Win) implementation of Canvas
 * https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 */
const MAX_CANVAS_WIDTH = 8000;

const getNumberOfCanvases = (lastCanvasWidth: number, numberOfWholeCanvases: number) => {
    if (lastCanvasWidth > 0) {
        return numberOfWholeCanvases + 1;
    } else {
        return numberOfWholeCanvases;
    }
};

export const getZoomLevel = (zoomLevel: number) => {
    return ZOOM_LEVELS[zoomLevel];
};

export type CanvasParameters = {
    canvasWidth: number;
    numberedCanvasTicks: number[];
};

interface TimelineProps {
    duration: number;
    zoomLevel: number;
    timelineTrackHeight: number;
}

export const TimelineRuler = ({
    duration,
    zoomLevel,
    timelineTrackHeight,
}: TimelineProps): JSX.Element => {
    const secondsOnTimeline: number = Math.ceil(duration);

    const sxProps = {
        borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
    };

    const { rulerTickXCoordinateOffset, rulerTickFrequencyInSeconds, numberFrequencyInSeconds } =
        getZoomLevel(zoomLevel);

    const rulerUnitWidth = rulerTickXCoordinateOffset + RULER_TICK_WIDTH;

    const rulerWidth = rulerUnitWidth * (secondsOnTimeline / rulerTickFrequencyInSeconds);

    const numberOfWholeCanvases = Math.floor(rulerWidth / MAX_CANVAS_WIDTH);

    const ticksPerWholeCanvas = MAX_CANVAS_WIDTH / rulerUnitWidth;

    const lastCanvasWidth = rulerWidth % MAX_CANVAS_WIDTH;

    const ticksInLastCanvas = lastCanvasWidth / rulerUnitWidth;

    const numberOfCanvases = getNumberOfCanvases(lastCanvasWidth, numberOfWholeCanvases);

    const numberOfCanvasesAsArray = [...Array(numberOfCanvases).keys()];

    const secondsOnTimelineAsArray = [...Array(secondsOnTimeline).keys()];

    console.log({ len: secondsOnTimelineAsArray.length });

    const canvases = numberOfCanvasesAsArray.reduce((acc: CanvasParameters[], currentCanvas) => {
        if (currentCanvas < numberOfCanvasesAsArray.length - 1) {
            const start = currentCanvas * ticksPerWholeCanvas;

            const end = start + ticksPerWholeCanvas;

            return acc.concat({
                canvasWidth: MAX_CANVAS_WIDTH,
                numberedCanvasTicks: secondsOnTimelineAsArray.slice(start, end),
            });
        } else {
            const start = currentCanvas * ticksPerWholeCanvas;

            const end = start + ticksInLastCanvas;

            return acc.concat({
                canvasWidth: lastCanvasWidth,
                numberedCanvasTicks: secondsOnTimelineAsArray.slice(start, end),
            });
        }
    }, []);

    return (
        <Box component="span" sx={{ position: 'relative', display: 'flex', flexDirection: 'row' }}>
            {canvases.map((canvas, index) => (
                <TimelineCanvas
                    key={index}
                    canvasWidth={canvas.canvasWidth}
                    numberedCanvasTicks={canvas.numberedCanvasTicks}
                    rulerUnitWidth={rulerUnitWidth}
                    rulerTickFrequencyInSeconds={rulerTickFrequencyInSeconds}
                    numberFrequencyInSeconds={numberFrequencyInSeconds}
                    sxProps={sxProps}
                    rulerTickWidth={RULER_TICK_WIDTH}
                />
            ))}
        </Box>
    );
};
