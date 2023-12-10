import { RulerTick } from './media-timeline-ruler-tick';

interface TimelineProps {
    duration: number;
    zoomFactor: number;
}

export const TimelineRuler = ({ duration, zoomFactor }: TimelineProps): JSX.Element => {
    const timelineLength = Math.ceil(duration);

    const rulerTicks: number[] = [...Array(timelineLength).keys()];

    return (
        <>
            {rulerTicks.map((_, index) => (
                <RulerTick key={index} index={index} zoomFactor={zoomFactor} />
            ))}
        </>
    );
};
