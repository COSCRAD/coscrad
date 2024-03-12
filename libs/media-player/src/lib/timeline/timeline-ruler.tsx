import { Box } from '@mui/material';
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

type ZoomLevels = {
    rulerTickXCoordinateOffset: number;
    rulerTickFrequencyInSeconds: number;
};

const zoomLevels: ZoomLevels[] = [
    { rulerTickXCoordinateOffset: 9, rulerTickFrequencyInSeconds: 1 },
    { rulerTickXCoordinateOffset: 10, rulerTickFrequencyInSeconds: 2 },
];

const getZoomLevel = (zoomLevel: number) => {
    return zoomLevels[zoomLevel];
};

export type CanvasParameters = {
    canvasWidth: number;
    ticksPerCanvas: number;
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
    const secondsOnTimeline: number[] = [...Array(Math.ceil(duration)).keys()];

    const rulerHeight = timelineTrackHeight / 2;

    const sxProps = {
        borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
    };

    const rulerTickWidth = 1;

    const rulerTickHeight = 10;

    const rulerTickWithNumberHeight = 20;

    const rulerTickY = rulerHeight - rulerTickHeight;

    const { rulerTickXCoordinateOffset, rulerTickFrequencyInSeconds } = getZoomLevel(zoomLevel);

    const rulerUnitWidth = rulerTickXCoordinateOffset + rulerTickWidth;

    /**
     * THIS NEEDS TO BE MOVED INTO THE PARENT COMPONENT
     */
    const rulerWidth = rulerUnitWidth * (secondsOnTimeline.length / rulerTickFrequencyInSeconds);

    const numberOfWholeCanvases = Math.floor(rulerWidth / MAX_CANVAS_WIDTH);

    const lastCanvasWidth = rulerWidth % MAX_CANVAS_WIDTH;

    const numberOfCanvases = getNumberOfCanvases(lastCanvasWidth, numberOfWholeCanvases);

    const numberOfCanvasesAsArray = [...Array(numberOfCanvases).keys()];

    const ticksPerWholeCanvas = MAX_CANVAS_WIDTH / rulerUnitWidth;

    const canvases = numberOfCanvasesAsArray.reduce((acc: CanvasParameters[], currentCanvas) => {
        if (currentCanvas < numberOfCanvasesAsArray.length - 1) {
            return acc.concat({
                canvasWidth: MAX_CANVAS_WIDTH,
                ticksPerCanvas: ticksPerWholeCanvas,
            });
        } else {
            const ticksInLastCanvas = lastCanvasWidth / rulerUnitWidth;

            return acc.concat({
                canvasWidth: lastCanvasWidth,
                ticksPerCanvas: ticksInLastCanvas,
            });
        }
    }, []);

    return (
        <Box component="span" sx={{ position: 'relative' }}>
            {canvases.map((canvas, index) => (
                <TimelineCanvas
                    key={index}
                    canvasWidth={canvas.canvasWidth}
                    ticksPerCanvas={canvas.ticksPerCanvas}
                    rulerTickXCoordinateOffset={rulerTickXCoordinateOffset}
                    rulerTickFrequencyInSeconds={rulerTickFrequencyInSeconds}
                    sxProps={sxProps}
                    rulerHeight={rulerHeight}
                    rulerTickY={rulerTickY}
                    rulerTickWidth={rulerTickWidth}
                    rulerTickHeight={rulerHeight}
                />
            ))}
        </Box>
    );
};
