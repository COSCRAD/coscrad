import { Canvas } from '../shared/canvas/canvas';
import { Draw } from '../shared/canvas/use-canvas';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';

const zoomLevels = [
    { rulerTickOffset: 9, rulerTickFrequency: 1 },
    { rulerTickOffset: 10, rulerTickFrequency: 2 },
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
    const rulerLength = Math.ceil(duration);

    const rulerHeight = timelineTrackHeight / 2;

    const sxProps = {
        borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
    };

    const rulerTickWidth = 1;

    const rulerTickHeight = 10;

    const rulerTickWithNumberHeight = 20;

    const rulerTickY = rulerHeight - rulerTickHeight;

    const rulerTicks: number[] = [...Array(rulerLength).keys()];

    // const rulerTickOffset = renderedTimelineLength / rulerLength;

    const rulerTickOffset = getZoomLevel(zoomLevel).rulerTickOffset;

    const rulerTickFrequency = getZoomLevel(zoomLevel).rulerTickFrequency;

    const rulerWidth = rulerTickOffset * (rulerTicks.length / rulerTickFrequency);

    const drawCanvas: Draw = (context) => {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height);

        context.fillStyle = RULER_TICKS_AND_NUMBERS_COLOR;

        rulerTicks.forEach((tick, index) => {
            if (index % rulerTickFrequency !== 0) return;

            const tickX = tick * rulerTickOffset;

            context.fillRect(tickX, rulerTickY, rulerTickWidth, rulerTickHeight);
        });
    };

    return (
        <Canvas
            canvasId="timeline-ruler"
            draw={drawCanvas}
            width={rulerWidth}
            height={rulerHeight}
            sxProps={sxProps}
        />
    );
};
