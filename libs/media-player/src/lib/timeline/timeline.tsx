import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT, TIMELINE_RULER_BAR_HEIGHT, ZOOM_FACTOR } from './constants';
import { convertTimecodeToRelativeTimelineUnits } from './convert-timecode-to-relative-timeline-units';
import { RangeBar } from './range-bar';
import { RULER_TICKS_AND_NUMBERS_COLOR } from './ruler-tick';
import { TimelineRuler } from './timeline-ruler';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const StyledTimelineBox = styled(Box)({
    width: '99%',
    paddingTop: `2px`,
    paddingBottom: `2px`,
    border: '1px solid #666',
    backgroundColor: '#ddd',
    display: 'flex',
});

const ScrollingBox = styled('div')({
    overflowX: 'scroll',
    scrollBehavior: 'smooth',
    position: 'relative',
});

const StyledScrolledTrack = styled(Box)({
    minWidth: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    border: '1px solid #666',
    borderRadius: '7px',
    backgroundBlendMode: 'saturation',
    backgroundSize: `auto ${EDITOR_SOUND_BAR_HEIGHT + 5}px`,
});

const StyledTimelineRulerBox = styled('div')({
    marginBottom: '3px',
    borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
    boxSizing: 'border-box',
    position: 'relative',
});

const EditorPlayhead = styled('div')({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    width: '1px',
    backgroundColor: 'red',
    position: 'absolute',
    // animationName: `${movePlayhead}`,
    // animationDuration: '2s',
    // animationTimingFunction: 'ease-in',
    // animationIterationCount: 'infinite',
    zIndex: 1500,
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
}

export const Timeline = ({
    timeRangeClips,
    durationSeconds,
    name,
    timelineRef,
    audioRef,
}: TimelineProps) => {
    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(0);

    const currentTime = audioRef.current?.currentTime;

    const timelineRuler = useMemo(() => {
        return (
            <TimelineRuler
                duration={durationSeconds}
                renderedTimelineLength={renderedTimelineLength}
            />
        );
    }, [durationSeconds, renderedTimelineLength]);

    useEffect(() => {
        if (isNullOrUndefined(timelineRef.current)) return;

        const timelineBoxWidth = timelineRef.current.getBoundingClientRect().width;

        setRenderedTimelineLength(timelineBoxWidth * ZOOM_FACTOR);

        if (
            isNullOrUndefined(currentTime) ||
            isNullOrUndefined(durationSeconds) ||
            isNullOrUndefined(scrollingBoxRef.current)
        )
            return;

        const editorStickyPoint = timelineBoxWidth / 2;

        const trackPosition = convertTimecodeToRelativeTimelineUnits(
            renderedTimelineLength,
            currentTime,
            durationSeconds
        );

        const scrollLeft = trackPosition - editorStickyPoint;

        scrollingBoxRef.current.scrollTo({
            top: 0,
            left: scrollLeft,
            behavior: 'smooth',
        });
    }, [timelineRef, durationSeconds, currentTime, renderedTimelineLength]);

    return (
        <StyledTimelineBox
            sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT + 20}px` }}
            ref={timelineRef}
            data-testid={`timeline:${name}`}
        >
            <Box
                sx={{
                    paddingTop: `${EDITOR_SOUND_BAR_HEIGHT}px`,
                    padding: '2px',
                    width: '6%',
                    maxWidth: '45px',
                    borderRight: '1px solid #666',
                    wordWrap: 'break-word',
                }}
            >
                {/* TODO need an icon here for annotations */}
                Annotations
            </Box>
            <Box sx={{ flexGrow: 1, width: '94%' }}>
                <ScrollingBox
                    sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT + 20}px` }}
                    data-testid="scroll-container"
                    ref={scrollingBoxRef}
                >
                    <StyledScrolledTrack
                        data-testid="timeline-ruler"
                        sx={{ width: `${renderedTimelineLength}px` }}
                    >
                        <StyledTimelineRulerBox
                            sx={{
                                width: `${renderedTimelineLength}px`,
                                height: `${TIMELINE_RULER_BAR_HEIGHT}px`,
                            }}
                        >
                            {durationSeconds > 0 ? timelineRuler : null}
                        </StyledTimelineRulerBox>
                    </StyledScrolledTrack>
                    <StyledScrolledTrack
                        data-testid="scrollable-track"
                        sx={{
                            width: `${renderedTimelineLength}px`,
                            backgroundImage: `url(${WAVE_FORM_URL})`,
                        }}
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
            </Box>
        </StyledTimelineBox>
    );
};
