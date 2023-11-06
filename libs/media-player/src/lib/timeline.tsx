import { styled } from '@mui/material';

const TimelineContainer = styled('div')({
    position: 'relative',
    marginBottom: '2px',
    boxSizing: 'border-box',
});

const TimeSegment = styled('div')({
    width: '1px',
    backgroundColor: '#000',
    position: 'absolute',
});

interface TimelineProps {
    duration: number;
}

export const Timeline = ({ duration }: TimelineProps): JSX.Element => {
    const timelineLength = Math.ceil(duration);

    console.log({ timelineLength });

    const timeSegments: number[] = [...Array(timelineLength).keys()];

    console.log({ timeSegments });

    return (
        <TimelineContainer>
            {timeSegments.map((_, index) => (
                <TimeSegment key={index} sx={{ height: '10px', left: `${index + 4}px` }} />
            ))}
        </TimelineContainer>
    );
};
