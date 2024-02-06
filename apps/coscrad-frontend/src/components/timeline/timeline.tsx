import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT, ZOOM_FACTOR } from './constants';
import { RangeBar } from './range-bar';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const StyledTimelineBox = styled(Box)({
    width: '100%',
    height: `${EDITOR_SOUND_BAR_HEIGHT + 20}px`,
    paddingTop: `2px`,
    paddingBottom: `2px`,
    border: '1px solid #666',
    backgroundColor: '#ddd',
    overflowX: 'scroll',
});

const StyledScrolledTrack = styled(Box)({
    minWidth: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    border: '1px solid #666',
    borderRadius: '7px',
    backgroundImage: `url(${WAVE_FORM_URL})`,
    backgroundBlendMode: 'lighten',
    backgroundSize: `auto ${EDITOR_SOUND_BAR_HEIGHT + 5}px`,
});

export type TimeRangeSeconds = {
    inPointSeconds: number;
    outPointSeconds: number;
};

export interface TimeRangeClip {
    timeRangeSeconds: TimeRangeSeconds;
    label: React.ReactNode;
}

interface TimelineProps {
    durationSeconds: number;
    timeRangeClips: TimeRangeClip[];
    name: string;
}

export const Timeline = ({ timeRangeClips, durationSeconds, name }: TimelineProps) => {
    const timelineRef = useRef<HTMLDivElement>(null);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(null);

    useEffect(() => {
        if (!isNullOrUndefined(timelineRef.current)) {
            const timelineBoxWidth = timelineRef.current.getBoundingClientRect().width;

            setRenderedTimelineLength(timelineBoxWidth * ZOOM_FACTOR);
        }
    }, [timelineRef]);

    return (
        <StyledTimelineBox ref={timelineRef} data-testid={`timeline:${name}`}>
            <StyledScrolledTrack
                data-testid="scrollable-track"
                sx={{ width: `${renderedTimelineLength}px` }}
            >
                {!isNullOrUndefined(renderedTimelineLength)
                    ? timeRangeClips.map((timeRangeClip) => (
                          <RangeBar
                              key={JSON.stringify(timeRangeClip.timeRangeSeconds)}
                              renderedTimelineLength={renderedTimelineLength}
                              timeRangeClip={timeRangeClip}
                              durationSeconds={durationSeconds}
                          />
                      ))
                    : null}
            </StyledScrolledTrack>
        </StyledTimelineBox>
    );
};
