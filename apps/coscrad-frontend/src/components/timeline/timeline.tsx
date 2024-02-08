import { isNull, isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Typography, styled } from '@mui/material';
import { RefObject, useContext, useEffect, useRef, useState } from 'react';
import { MediaCurrentTimeContext } from '../resources/shared/media-currenttime-provider';
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
    backgroundBlendMode: 'lighten',
    backgroundSize: `auto ${EDITOR_SOUND_BAR_HEIGHT + 5}px`,
    scrollBehavior: 'smooth',
});

const ScrollingBox = styled('div')({
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
}

export const Timeline = ({ timeRangeClips, durationSeconds, name, timelineRef }: TimelineProps) => {
    const trackRef = useRef<HTMLDivElement>(null);

    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    const { mediaCurrentTimeFromContext, setMediaCurrentTimeFromContext } =
        useContext(MediaCurrentTimeContext);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(null);

    const [scrollPositionFeedback, setScrollPositionFeedback] = useState<any>('none');

    const scrollLeft = (amount: number) => {
        trackRef.current.scrollLeft = amount;

        console.log(`trying to scroll ${amount}`);
    };

    useEffect(() => {
        if (!isNullOrUndefined(trackRef)) {
            console.log({ left: trackRef.current.scrollLeft });
            scrollLeft(800);

            console.log({ left: trackRef.current.scrollLeft });
        }
    }, [trackRef]);

    useEffect(() => {
        if (!isNullOrUndefined(timelineRef.current)) {
            const timelineBoxWidth = timelineRef.current.getBoundingClientRect().width;

            setRenderedTimelineLength(timelineBoxWidth * ZOOM_FACTOR);

            if (!isNull(mediaCurrentTimeFromContext)) {
                const editorStickyPoint = timelineBoxWidth / 3;

                const trackPosition = convertTimecodeToRelativeTimelineUnits(
                    renderedTimelineLength,
                    mediaCurrentTimeFromContext,
                    durationSeconds
                );

                const scrollLeft = trackPosition - editorStickyPoint;

                console.log({ scrollLeft });

                setScrollPositionFeedback(scrollLeft);

                scrollingBoxRef.current.scrollLeft += scrollLeft;

                // scrolledTrackRef.current.scrollTo({
                //     top: 0,
                //     left: scrollLeft,
                // });
            }
        }
    }, [
        timelineRef,
        trackRef,
        durationSeconds,
        mediaCurrentTimeFromContext,
        renderedTimelineLength,
    ]);

    return (
        <>
            <Typography variant="h4">Media CurrentTime: {mediaCurrentTimeFromContext}</Typography>
            <Typography variant="h4">
                Should scroll to: {JSON.stringify(scrollPositionFeedback)}
                <div>
                    <button onClick={() => scrollLeft(900)}>Scroll!</button>
                </div>
            </Typography>
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
        </>
    );
};
