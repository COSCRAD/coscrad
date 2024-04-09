import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Tooltip, styled } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import { asFormattedMediaTimecodeString } from '../shared/as-formatted-media-timecode-string';
import { EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS, ZOOM_LEVELS, ZoomLevels } from './constants';
import { convertTimecodeToTimelineUnits } from './convert-timecode-to-timeline-units';
import { convertTimelineUnitsToTimecode } from './convert-timeline-units-to-timecode';
import { getZoomLevelConfig } from './get-zoom-level';
import { RangeBar } from './range-bar';
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
    height: `${EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS}px`,
    padding: '2px',
    wordWrap: 'break-word',
    overflow: 'hidden',
    boxSizing: 'border-box',
});

const StyledScrolledTrack = styled(Box)({
    minWidth: '100%',
    position: 'relative',
    display: 'flex',
    height: `${EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS}px`,
    border: '1px solid #666',
    borderRadius: '7px',
    backgroundBlendMode: 'saturation',
    backgroundSize: `auto ${EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS + 5}px`,
    boxSizing: 'border-box',
});

const StyledTimelineRulerBox = styled('div')({
    marginBottom: '3px',
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

export type TimelineTrack = {
    trackLabel: string;
    timelineTrack: TimeRangeClip[];
};

interface TimelineProps {
    durationSeconds: number;
    timelineTracks: TimelineTrack[];
    name: string;
    audioRef: RefObject<HTMLAudioElement>;
    isPlaying: boolean;
    seekInMedia: (newTime: number) => void;
    mediaCurrentTimeFromContext: number;
}

export const Timeline = ({
    timelineTracks,
    durationSeconds,
    name,
    audioRef,
    isPlaying,
    seekInMedia,
    mediaCurrentTimeFromContext,
}: TimelineProps) => {
    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    const playheadRef = useRef<HTMLDivElement>(null);

    const [renderedTimelineLength, setRenderedTimelineLength] = useState<number>(0);

    const [playheadPositionInPixels, setplayheadPositionInPixels] = useState<number>(0);

    const initialZoomLevel = 5;

    const [zoomLevel, setZoomLevel] = useState<number>(initialZoomLevel);

    const initialZoomLevelConfig = ZOOM_LEVELS[initialZoomLevel];

    const [zoomLevelConfig, setZoomLevelConfig] = useState<ZoomLevels>(initialZoomLevelConfig);

    // NEED TO SET RULER WIDTH
    const [rulerWidth, setRulerWidth] = useState<number>(0);

    const currentTime = audioRef.current?.currentTime;

    const numberOfTracksDisplayed = [...timelineTracks, 'timeline ruler'].length;

    /**
     * begin copy
     */
    const secondsOnTimeline: number = Math.ceil(durationSeconds);

    useEffect(() => {
        // Set playhead position when playing from currentTime
        if (isNullOrUndefined(currentTime) || isNullOrUndefined(durationSeconds)) return;

        const currentPlayheadPositionInPixels = convertTimecodeToTimelineUnits(
            rulerWidth,
            currentTime,
            durationSeconds
        );

        setplayheadPositionInPixels(currentPlayheadPositionInPixels);
    }, [rulerWidth, currentTime, durationSeconds, setplayheadPositionInPixels]);

    useEffect(() => {
        // Scroll timeline when playing
        if (!isPlaying && mediaCurrentTimeFromContext === null) return;

        if (
            isNullOrUndefined(currentTime) ||
            isNullOrUndefined(durationSeconds) ||
            isNullOrUndefined(scrollingBoxRef.current)
        )
            return;

        const timelineBoxWidth = scrollingBoxRef.current.getBoundingClientRect().width;

        const editorStickyPoint = timelineBoxWidth / 2;

        const currentPlayheadPosition = convertTimecodeToTimelineUnits(
            rulerWidth,
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
        rulerWidth,
        durationSeconds,
        currentTime,
        setplayheadPositionInPixels,
        isPlaying,
        mediaCurrentTimeFromContext,
    ]);

    const zoomIn = () => {
        console.log(`Zoom in at level: ${zoomLevel}`);

        if (zoomLevel === 0) return;

        // How to zoom dynamically so entire timeline is in view?
        const newZoomLevel = zoomLevel - 1;

        setZoomLevel(newZoomLevel);

        const newZoomLevelConfig = getZoomLevelConfig(newZoomLevel);

        setZoomLevelConfig(newZoomLevelConfig);
    };

    const zoomOut = () => {
        console.log(`Zoom in at level: ${zoomLevel} for ${ZOOM_LEVELS.length}`);

        if (zoomLevel >= ZOOM_LEVELS.length - 1) return;

        const newZoomLevel = zoomLevel + 1;

        setZoomLevel(newZoomLevel);

        const newZoomLevelConfig = getZoomLevelConfig(newZoomLevel);

        setZoomLevelConfig(newZoomLevelConfig);
    };

    const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
        const mouseClickViewportPositionX = event.clientX;

        const scrollableDivParent = event.currentTarget.parentElement;

        if (isNullOrUndefined(scrollableDivParent)) return;

        const offSetLeftFromViewPortOfScrollableDivParent =
            scrollableDivParent.getBoundingClientRect().left;

        const scrollLeftOfScrollableDiv = scrollableDivParent.scrollLeft;

        console.log({
            scrollLeftOfScrollableDiv: scrollLeftOfScrollableDiv,
        });

        const clickPositionInTimelineUnits =
            mouseClickViewportPositionX -
            offSetLeftFromViewPortOfScrollableDivParent +
            scrollLeftOfScrollableDiv;

        setplayheadPositionInPixels(clickPositionInTimelineUnits);

        const seekPosition = convertTimelineUnitsToTimecode(
            clickPositionInTimelineUnits,
            rulerWidth,
            durationSeconds
        );

        seekInMedia(seekPosition);
    };

    return (
        <>
            <Box>Playhead: {playheadPositionInPixels}</Box>
            <Box>Rendered Timeline: {rulerWidth}</Box>
            <Box>Seconds On Timeline: {secondsOnTimeline}</Box>
            <Box>
                Current Time:{' '}
                {!isNullOrUndefined(currentTime) ? asFormattedMediaTimecodeString(currentTime) : ''}
            </Box>
            <Box>
                Duration from Player: {durationSeconds} /{' '}
                {asFormattedMediaTimecodeString(durationSeconds)}
            </Box>
            <Box>ZoomLevel From Config: {zoomLevelConfig.zoomLevel}</Box>
            <Divider />
            <Box>
                <Tooltip title="Zoom In">
                    <span>
                        <IconButton
                            data-testid="timeline-zoom-in-button"
                            onClick={zoomIn}
                            // disabled={!isPlayable}
                        >
                            <ZoomInIcon />
                        </IconButton>
                    </span>
                </Tooltip>
                <Tooltip title="Zoom Out">
                    <span>
                        <IconButton
                            data-testid="timeline-zoom-out-button"
                            onClick={zoomOut}
                            // disabled={!isPlayable}
                        >
                            <ZoomOutIcon />
                        </IconButton>
                    </span>
                </Tooltip>
            </Box>
            <StyledTimelineBox
                sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS + 10}px` }}
                data-testid={`timeline:${name}`}
            >
                <Box
                    data-testid="timeline-left-side-labels"
                    sx={{
                        paddingTop: `${EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS}px`,
                        width: '6%',
                        maxWidth: '45px',
                        borderRight: '1px solid #666',
                    }}
                >
                    {timelineTracks.map((timelineTrack) => (
                        <StyledTrackLabel key={timelineTrack.trackLabel} sx={{ fontSize: '10px' }}>
                            {/* TODO need an icon here for annotations */}
                            {timelineTrack.trackLabel}
                        </StyledTrackLabel>
                    ))}
                </Box>
                <Box
                    data-testid="tracks-container"
                    sx={{ flexGrow: 1, width: '94%', position: 'relative' }}
                >
                    <ScrollingBox
                        ref={scrollingBoxRef}
                        sx={{ height: `${2 * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS + 20}px` }}
                        data-testid="scroll-container"
                        // TODO move onClick to timeline and get position via parent(?)
                    >
                        <StyledScrolledTrack
                            data-testid="timeline-ruler"
                            sx={{ width: `${rulerWidth}px` }}
                            // onClick={handleSeek}
                        >
                            <EditorPlayhead
                                ref={playheadRef}
                                data-testid="playhead"
                                sx={{
                                    height: `${
                                        numberOfTracksDisplayed * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS
                                    }px`,
                                    left: `${playheadPositionInPixels}px`,
                                }}
                            />
                            <StyledTimelineRulerBox
                                sx={{
                                    width: `${rulerWidth}px`,
                                }}
                            >
                                {durationSeconds > 0 ? (
                                    <TimelineRuler
                                        duration={durationSeconds}
                                        zoomLevelConfig={zoomLevelConfig}
                                        timelineTrackHeight={EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS}
                                    />
                                ) : null}
                            </StyledTimelineRulerBox>
                        </StyledScrolledTrack>
                        {timelineTracks.length !== 0 ? (
                            <StyledScrolledTrack
                                data-testid="scrollable-track"
                                sx={{
                                    width: `${rulerWidth}px`,
                                    // backgroundImage: `url(${WAVE_FORM_URL})`,
                                }}
                            >
                                {!isNullOrUndefined(rulerWidth)
                                    ? timelineTracks.map((timelineTrack) => {
                                          return timelineTrack.timelineTrack.map(
                                              (timeRangeClip) => (
                                                  <RangeBar
                                                      key={JSON.stringify(
                                                          timeRangeClip.timeRangeSeconds
                                                      )}
                                                      rulerWidth={rulerWidth}
                                                      timeRangeClip={timeRangeClip}
                                                      durationSeconds={durationSeconds}
                                                  />
                                              )
                                          );
                                      })
                                    : null}
                            </StyledScrolledTrack>
                        ) : null}
                    </ScrollingBox>
                </Box>
            </StyledTimelineBox>
        </>
    );
};
