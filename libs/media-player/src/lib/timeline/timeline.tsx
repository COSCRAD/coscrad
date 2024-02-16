import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, styled } from '@mui/material';
import { RefObject, useEffect, useMemo, useRef, useState } from 'react';
import { EDITOR_SOUND_BAR_HEIGHT, ZOOM_FACTOR } from './constants';
import { convertTimecodeToTimelineUnits } from './convert-timecode-to-relative-timeline-units';
import { convertTimelineUnitsToTimecode } from './convert-timeline-units-to-timecode';
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
    boxSizing: 'border-box',
});

const ScrollingBox = styled('div')({
    overflowX: 'scroll',
    scrollBehavior: 'smooth',
    position: 'relative',
    boxSizing: 'border-box',
});

const StyledTrackLabel = styled(Box)({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    padding: '2px',
    wordWrap: 'break-word',
    overflow: 'hidden',
    boxSizing: 'border-box',
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
    boxSizing: 'border-box',
});

const StyledTimelineRulerBox = styled('div')({
    marginBottom: '3px',
    borderBottom: `1px solid ${RULER_TICKS_AND_NUMBERS_COLOR}`,
    boxSizing: 'border-box',
    position: 'relative',
});

const EditorPlayhead = styled('div')({
    top: '0px',
    width: '1px',
    backgroundColor: 'red',
    position: 'absolute',
    // animationName: `${movePlayhead}`,
    // animationDuration: '2s',
    // animationTimingFunction: 'ease-in',
    // animationIterationCount: 'infinite',
    boxSizing: 'border-box',
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
    audioRef: RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    seekInMedia: (newTime: number) => void;
}

export const Timeline = ({
    timeRangeClips,
    durationSeconds,
    name,
    audioRef,
    isPlaying,
    seekInMedia,
}: TimelineProps) => {
    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    const playheadRef = useRef<HTMLDivElement>(null);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(0);

    const [renderedTimelineHeight, setRenderedTimelineHeight] = useState<number>(0);

    const [playheadPosition, setplayheadPosition] = useState<number>(0);

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
        // Render timeline
        if (isNullOrUndefined(scrollingBoxRef.current)) return;

        const timelineBoxWidth = scrollingBoxRef.current.getBoundingClientRect().width;

        setRenderedTimelineLength(timelineBoxWidth * ZOOM_FACTOR);

        setRenderedTimelineHeight(scrollingBoxRef.current.getBoundingClientRect().height);
    }, [scrollingBoxRef, setRenderedTimelineLength, setRenderedTimelineHeight]);

    useEffect(() => {
        // Set playhead position
        if (isNullOrUndefined(currentTime) || isNullOrUndefined(durationSeconds)) return;

        const currentPlayheadPosition = convertTimecodeToTimelineUnits(
            renderedTimelineLength,
            currentTime,
            durationSeconds
        );

        setplayheadPosition(currentPlayheadPosition);
    }, [renderedTimelineLength, currentTime, durationSeconds, setplayheadPosition]);

    useEffect(() => {
        // Scroll timeline when playing
        if (!isPlaying) return;

        if (
            isNullOrUndefined(currentTime) ||
            isNullOrUndefined(durationSeconds) ||
            isNullOrUndefined(scrollingBoxRef.current)
        )
            return;

        const timelineBoxWidth = scrollingBoxRef.current.getBoundingClientRect().width;

        const editorStickyPoint = timelineBoxWidth / 2;

        const currentPlayheadPosition = convertTimecodeToTimelineUnits(
            renderedTimelineLength,
            currentTime,
            durationSeconds
        );

        const scrollLeft = currentPlayheadPosition - editorStickyPoint;

        scrollingBoxRef.current.scrollTo({
            top: 0,
            left: scrollLeft,
            behavior: 'smooth',
        });
    }, [
        scrollingBoxRef,
        renderedTimelineLength,
        durationSeconds,
        currentTime,
        setplayheadPosition,
        isPlaying,
    ]);

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
        const mouseClickViewportPositionX = event.clientX;

        const offSetLeftFromViewPortOfScrollableDiv =
            event.currentTarget.getBoundingClientRect().left;

        const scrollLeftOfScrollableDiv = event.currentTarget.scrollLeft;

        const clickPositionInTimelineUnits =
            mouseClickViewportPositionX -
            offSetLeftFromViewPortOfScrollableDiv +
            scrollLeftOfScrollableDiv;

        setplayheadPosition(clickPositionInTimelineUnits);

        const seekPosition = convertTimelineUnitsToTimecode(
            clickPositionInTimelineUnits,
            renderedTimelineLength,
            durationSeconds
        );

        seekInMedia(seekPosition);
    };

    return (
        <>
            <Box>Playhead: {playheadPosition}</Box>
            <Box>Rendered Timeline: {renderedTimelineLength}</Box>
            <StyledTimelineBox
                sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT + 10}px` }}
                data-testid={`timeline:${name}`}
            >
                <Box
                    data-testid="timeline-left-side-labels"
                    sx={{
                        paddingTop: `${EDITOR_SOUND_BAR_HEIGHT}px`,
                        width: '6%',
                        maxWidth: '45px',
                        borderRight: '1px solid #666',
                    }}
                >
                    <StyledTrackLabel sx={{ fontSize: '10px' }}>
                        {/* TODO need an icon here for annotations */}
                        Annotations
                    </StyledTrackLabel>
                </Box>
                <Box
                    data-testid="tracks-container"
                    sx={{ flexGrow: 1, width: '94%', position: 'relative' }}
                >
                    <ScrollingBox
                        ref={scrollingBoxRef}
                        sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT + 20}px` }}
                        data-testid="scroll-container"
                        // TODO move onClick to timeline and get position via parent(?)
                        onClick={handleSeek}
                    >
                        <StyledScrolledTrack
                            data-testid="timeline-ruler"
                            sx={{ width: `${renderedTimelineLength}px` }}
                        >
                            <EditorPlayhead
                                ref={playheadRef}
                                sx={{
                                    height: `${renderedTimelineHeight - 4}px`,
                                    left: `${playheadPosition}px`,
                                }}
                            />
                            <StyledTimelineRulerBox
                                sx={{
                                    width: `${renderedTimelineLength}px`,
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
        </>
    );
};
