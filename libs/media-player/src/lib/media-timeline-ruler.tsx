import { styled } from '@mui/material';
import { TIMELINE_RULER_BAR_HEIGHT } from './media-timeline-constants';
import { RulerTick, TICK_SPACING_FACTOR } from './media-timeline-ruler-tick';

const TimelineRulerBox = styled('div')({
    marginBottom: '3px',
    borderBottom: '1px solid #fdec5e',
    boxSizing: 'border-box',
    position: 'relative',
});

interface TimelineProps {
    editorWidth: number;
    duration: number;
    zoomFactor: number;
}

export const TimelineRuler = ({
    editorWidth,
    duration,
    zoomFactor,
}: TimelineProps): JSX.Element => {
    console.log({ editorWidth });

    const rulerLength =
        duration > editorWidth ? Math.ceil(duration) : Math.ceil(editorWidth / TICK_SPACING_FACTOR);

    const rulerTicks: number[] = Array.from(Array(rulerLength).keys());

    return (
        <TimelineRulerBox
            sx={{ width: `${editorWidth}px`, height: `${TIMELINE_RULER_BAR_HEIGHT}px` }}
        >
            {rulerTicks.map((_, index) => (
                <RulerTick key={index} index={index} zoomFactor={zoomFactor} />
            ))}
        </TimelineRulerBox>
    );
};
