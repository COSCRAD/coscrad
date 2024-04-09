import { isNull } from '@coscrad/validation-constraints';
import { Box } from '@mui/material';
import { asFormattedMediaTimecodeString } from '../shared/as-formatted-media-timecode-string';
import { MAX_CANVAS_WIDTH_IN_PIXELS, RULER_TICK_WIDTH_IN_PIXELS, ZoomLevels } from './constants';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';
import { TimelineCanvas } from './timeline-canvas';

const getNumberOfCanvases = (lastCanvasWidth: number, numberOfWholeCanvases: number) => {
    if (lastCanvasWidth > 0) {
        return numberOfWholeCanvases + 1;
    } else {
        return numberOfWholeCanvases;
    }
};

export type TimelineTimecodeProps = {
    currentSecond: number;
    label?: string;
};

export type CanvasProps = {
    canvasWidth: number;
    ticksForThisCanvas: TimelineTimecodeProps[];
};

const sxProps = {
    borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
};

interface TimelineProps {
    duration: number;
    zoomLevelConfig: ZoomLevels;
    timelineTrackHeight: number;
}

export const TimelineRuler = ({
    duration,
    zoomLevelConfig,
    timelineTrackHeight,
}: TimelineProps): JSX.Element => {
    const roundedSecondsInDuration: number = Math.ceil(duration);

    console.log({ zoomLevelConfig });

    const {
        rulerTickXCoordinateOffset,
        rulerTickFrequencyInSeconds,
        timecodeDisplayFrequencyInSeconds,
    } = zoomLevelConfig;

    const ticksOnTimelineAtCurrentZoom = [...Array(roundedSecondsInDuration).keys()]
        .map((second) => {
            if (second % rulerTickFrequencyInSeconds === 0) {
                if (second % timecodeDisplayFrequencyInSeconds === 0) {
                    const timeCode = asFormattedMediaTimecodeString(second);

                    return {
                        second: second,
                        label: timeCode,
                    };
                }

                return {
                    second: second,
                };
            }

            return null;
        })
        .filter((second) => !isNull(second)) as unknown as TimelineTimecodeProps[];

    // Set up sequential timeline canvases

    const rulerUnitWidthInPixels = rulerTickXCoordinateOffset + RULER_TICK_WIDTH_IN_PIXELS;

    const rulerWidthInPixels = rulerUnitWidthInPixels * ticksOnTimelineAtCurrentZoom.length;

    const numberOfWholeCanvases = Math.floor(rulerWidthInPixels / MAX_CANVAS_WIDTH_IN_PIXELS);

    const ticksPerWholeCanvas = MAX_CANVAS_WIDTH_IN_PIXELS / rulerUnitWidthInPixels;

    const lastCanvasWidthInPixels = rulerWidthInPixels % MAX_CANVAS_WIDTH_IN_PIXELS;

    const ticksInLastCanvas = lastCanvasWidthInPixels / rulerUnitWidthInPixels;

    const numberOfCanvases = getNumberOfCanvases(lastCanvasWidthInPixels, numberOfWholeCanvases);

    const numberOfCanvasesAsArray = [...Array(numberOfCanvases).keys()];

    const canvases = numberOfCanvasesAsArray.reduce((acc: CanvasProps[], currentCanvas) => {
        if (currentCanvas < numberOfCanvasesAsArray.length - 1) {
            const start = currentCanvas * ticksPerWholeCanvas;

            const end = start + ticksPerWholeCanvas;

            return acc.concat({
                canvasWidth: MAX_CANVAS_WIDTH_IN_PIXELS,
                ticksForThisCanvas: ticksOnTimelineAtCurrentZoom.slice(start, end),
            });
        } else {
            const start = currentCanvas * ticksPerWholeCanvas;

            const end = start + ticksInLastCanvas;

            return acc.concat({
                canvasWidth: lastCanvasWidthInPixels,
                ticksForThisCanvas: ticksOnTimelineAtCurrentZoom.slice(start, end),
            });
        }
    }, []);

    return (
        <Box component="span" sx={{ position: 'relative', display: 'flex', flexDirection: 'row' }}>
            {canvases.map((canvas, index) => (
                <TimelineCanvas
                    key={index}
                    canvasWidth={canvas.canvasWidth}
                    ticksForThisCanvas={canvas.ticksForThisCanvas}
                    rulerUnitWidth={rulerUnitWidthInPixels}
                    timecodeDisplayFrequencyInSeconds={timecodeDisplayFrequencyInSeconds}
                    sxProps={sxProps}
                    rulerTickWidth={RULER_TICK_WIDTH_IN_PIXELS}
                />
            ))}
        </Box>
    );
};
