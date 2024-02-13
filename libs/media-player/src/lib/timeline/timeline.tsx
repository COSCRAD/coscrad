import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT, ZOOM_FACTOR } from './constants';
import { convertTimecodeToRelativeTimelineUnits } from './convert-timecode-to-relative-timeline-units';
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
    backgroundBlendMode: 'saturation',
    backgroundSize: `auto ${EDITOR_SOUND_BAR_HEIGHT + 5}px`,
    scrollBehavior: 'smooth',
});

const ScrollingBox = styled('div')({
    height: `${EDITOR_SOUND_BAR_HEIGHT + 20}px`,
    overflowX: 'scroll',
    position: 'relative',
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
    timelineRef: RefObject<HTMLDivElement>;
    audioRef: RefObject<HTMLAudioElement>;
    mediaCurrentTimeFromContext: number;
}

export const Timeline = ({
    timeRangeClips,
    durationSeconds,
    name,
    timelineRef,
    audioRef,
    mediaCurrentTimeFromContext,
}: TimelineProps) => {
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    // const { mediaCurrentTimeFromContext } = useContext(MediaCurrentTimeContext);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(0);

    useEffect(() => {
        if (isNullOrUndefined(timelineRef.current)) return;

        // if (isNullOrUndefined(renderedTimelineLength)) return;

        const timelineBoxWidth = timelineRef.current.getBoundingClientRect().width;

        setRenderedTimelineLength(timelineBoxWidth * ZOOM_FACTOR);

        if (
            isNull(mediaCurrentTimeFromContext) ||
            isNullOrUndefined(durationSeconds) ||
            isNullOrUndefined(scrollingBoxRef.current)
        )
            return;

        const editorStickyPoint = timelineBoxWidth / 2;

        const trackPosition = convertTimecodeToRelativeTimelineUnits(
            renderedTimelineLength,
            mediaCurrentTimeFromContext,
            durationSeconds
        );

        const scrollLeft = trackPosition - editorStickyPoint;

        scrollingBoxRef.current.scrollLeft += scrollLeft;
    }, [
        timelineRef,
        trackRef,
        durationSeconds,
        mediaCurrentTimeFromContext,
        renderedTimelineLength,
    ]);

    return (
        <StyledTimelineBox ref={timelineRef} data-testid={`timeline:${name}`}>
            <ScrollingBox data-testid="scroll-container" ref={scrollingBoxRef}>
                <StyledScrolledTrack
                    ref={trackRef}
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
            </ScrollingBox>
        </StyledTimelineBox>
    );
};
