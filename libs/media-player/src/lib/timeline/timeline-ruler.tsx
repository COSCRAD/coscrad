import { Canvas } from '../shared/canvas/canvas';
import { Draw } from '../shared/canvas/use-canvas';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';

/**
 * This limitation is from the IE 9 / 10 (Win) implementation of Canvas
 * https://jhildenbiddle.github.io/canvas-size/#/?id=test-results
 */
const MAX_CANVAS_WIDTH = 8000;

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

    const rulerWidth = rulerUnitWidth * (secondsOnTimeline.length / rulerTickFrequencyInSeconds);

    const numberOfWholeCanvases = Math.floor(rulerWidth / MAX_CANVAS_WIDTH);

    const lastCanvasWidth = rulerWidth % MAX_CANVAS_WIDTH;

    const getNumberOfCanvases = (lastCanvasWidth: number, numberOfWholeCanvases: number) => {
        if (lastCanvasWidth > 0) {
            return numberOfWholeCanvases + 1;
        } else {
            return numberOfWholeCanvases;
        }
    };

    const numberOfCanvases = getNumberOfCanvases(lastCanvasWidth, numberOfWholeCanvases);

    const numberOfCanvasesAsArray = [...Array(numberOfCanvases).keys()];

    const ticksPerWholeCanvas = MAX_CANVAS_WIDTH / rulerUnitWidth;

    type CanvasParameters = {
        canvasWidth: number;
        ticksPerCanvas: number;
    };

    const canvases = numberOfCanvasesAsArray.reduce((acc: CanvasParameters[], currentCanvas) => {
        if (currentCanvas < numberOfCanvasesAsArray.length) {
            return acc.concat({
                canvasWidth: MAX_CANVAS_WIDTH,
                ticksPerCanvas: ticksPerWholeCanvas,
            });
        } else {
            return acc.concat({
                canvasWidth: MAX_CANVAS_WIDTH,
                ticksPerCanvas: ticksPerWholeCanvas,
            });
        }
    }, []);

    console.log({ canvases: numberOfCanvases });

    /**
     * create an array of arrays of ticks to pass to the timeline canvas
     * component
     */

    // numberOfCanvases.forEach((wholeCanvas) => {});

    const drawCanvas: Draw = (context) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

        secondsOnTimeline.forEach((tick, index) => {
            if (index % rulerTickFrequencyInSeconds !== 0) return;

            const tickX = tick * rulerTickXCoordinateOffset;

            context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
        });
    };

    return (
        <Canvas
            canvasId="timeline-ruler"
            draw={drawCanvas}
            width={lastCanvasWidth}
            height={rulerHeight}
            sxProps={sxProps}
        />
    );
};
