import { RulerTick } from './ruler-tick';

interface TimelineProps {
    duration: number;
    renderedTimelineLength: number;
}

export const TimelineRuler = ({ duration, renderedTimelineLength }: TimelineProps): JSX.Element => {
    const rulerLength = Math.ceil(duration);

    const rulerTicks: number[] = [...Array(rulerLength).keys()];

    const rulerTickOffset = renderedTimelineLength / rulerLength;

    return (
        <>
            {rulerTicks.map((_, index) => (
                <RulerTick key={index} index={index} rulerTickOffset={rulerTickOffset} />
            ))}
        </>
    );
};
