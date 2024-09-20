import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { ZoomIn as ZoomInIcon, ZoomOut as ZoomOutIcon } from '@mui/icons-material';
import { Box, Divider, IconButton, Tooltip, styled } from '@mui/material';
import { RefObject, useEffect, useRef, useState } from 'react';
import './interactive-media-player-style.css';
import { RangeBar } from './range-bar';
import { asFormattedMediaTimecodeString } from './shared/as-formatted-media-timecode-string';
import { EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS, ZOOM_LEVELS, ZoomLevels } from './shared/constants';
import { convertTimecodeToTimelineUnits } from './shared/convert-timecode-to-timeline-units';
import { convertTimelineUnitsToTimecode } from './shared/convert-timeline-units-to-timecode';
import { getZoomLevelConfig } from './shared/get-zoom-level';
import { TimelineRuler } from './timeline-ruler';

const WAVE_FORM_URL = 'https://guujaaw.info/images/audio-wave-form.png';

const EDITOR_MARKER_PIXEL_WIDTH = 20;

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
    cursor: 'pointer',
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

const EditorInPoint = styled('div')({
    top: '0px',
    width: `${EDITOR_MARKER_PIXEL_WIDTH}px`,
    backgroundImage: 'linear-gradient(to right, #75ecff, rgba(255,0,0,0))',
    borderLeft: '1px solid #007082',
    borderTopLeftRadius: '7px',
    borderBottomLeftRadius: '7px',
    position: 'absolute',
    boxSizing: 'border-box',
    visibility: 'hidden',
    zIndex: 1500,
});

const EditorOutPoint = styled('div')({
    top: '0px',
    width: `${EDITOR_MARKER_PIXEL_WIDTH}px`,
    backgroundImage: 'linear-gradient(to left, #75ecff, rgba(255,0,0,0))',
    borderRight: '1px solid #007082',
    borderTopRightRadius: '7px',
    borderBottomRightRadius: '7px',
    position: 'absolute',
    boxSizing: 'border-box',
    visibility: 'hidden',
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

// Also in interactive-annotator.tsx
export enum TimelineTrackName {
    annotations = 'annotations',
    transcriptions = 'transcriptions',
}

export type TimelineTrack = {
    name: TimelineTrackName;
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
    inPointSeconds: number | null;
    outPointSeconds: number | null;
    mediaCurrentTimeFromContext: number;
    timelineTrackName: TimelineTrackName;
    setTimelineTrackName: (trackName: TimelineTrackName) => void;
}

export const Timeline = ({
    timelineTracks,
    durationSeconds,
    name,
    audioRef,
    isPlaying,
    seekInMedia,
    inPointSeconds,
    outPointSeconds,
    mediaCurrentTimeFromContext,
    timelineTrackName,
    setTimelineTrackName,
}: TimelineProps) => {
    const scrollingBoxRef = useRef<HTMLDivElement>(null);

    const playheadRef = useRef<HTMLDivElement>(null);

    const inPointRef = useRef<HTMLDivElement>(null);

    const outPointRef = useRef<HTMLDivElement>(null);

    const [playheadPositionInPixels, setPlayheadPositionInPixels] = useState<number>(0);

    const [inPointPositionInPixels, setInPointPositionInPixels] = useState<number>(0);

    const [outPointPositionInPixels, setOutPointPositionInPixels] = useState<number>(0);

    const initialZoomLevel = 5;

    const [zoomLevel, setZoomLevel] = useState<number>(initialZoomLevel);

    const initialZoomLevelConfig = ZOOM_LEVELS[initialZoomLevel];

    const [zoomLevelConfig, setZoomLevelConfig] = useState<ZoomLevels>(initialZoomLevelConfig);

    // NEED TO SET RULER WIDTH
    const [rulerWidth, setRulerWidth] = useState<number>(0);

    const currentTime = audioRef.current?.currentTime;

    const numberOfTracksDisplayed = [...timelineTracks, 'timeline ruler'].length;

    const secondsOnTimeline: number = Math.ceil(durationSeconds);

    useEffect(() => {
        // Set playhead position when playing from currentTime
        if (isNullOrUndefined(currentTime) || isNullOrUndefined(durationSeconds)) return;

        const currentPlayheadPositionInPixels = convertTimecodeToTimelineUnits(
            rulerWidth,
            currentTime,
            durationSeconds
        );

        setPlayheadPositionInPixels(currentPlayheadPositionInPixels);
    }, [rulerWidth, currentTime, durationSeconds, setPlayheadPositionInPixels]);

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
        setPlayheadPositionInPixels,
        isPlaying,
        mediaCurrentTimeFromContext,
    ]);

    useEffect(() => {
        // Set in and out points from annotator component
        if (isNullOrUndefined(inPointRef.current)) return;

        const inPointMarker = inPointRef.current;

        if (isNullOrUndefined(inPointSeconds)) {
            inPointMarker.style.visibility = 'hidden';

            return;
        }

        inPointMarker.style.visibility = 'visible';

        const currentInPointPositionInPixels = convertTimecodeToTimelineUnits(
            rulerWidth,
            inPointSeconds,
            durationSeconds
        );

        setInPointPositionInPixels(currentInPointPositionInPixels);

        if (isNullOrUndefined(outPointRef.current)) return;

        const outPointMarker = outPointRef.current;

        if (isNullOrUndefined(outPointSeconds)) {
            outPointMarker.style.visibility = 'hidden';

            return;
        }

        outPointMarker.style.visibility = 'visible';

        const currentOutPointPositionInPixels = convertTimecodeToTimelineUnits(
            rulerWidth,
            outPointSeconds,
            durationSeconds
        );

        setOutPointPositionInPixels(currentOutPointPositionInPixels - EDITOR_MARKER_PIXEL_WIDTH);
    }, [
        rulerWidth,
        inPointSeconds,
        outPointSeconds,
        durationSeconds,
        setInPointPositionInPixels,
        setOutPointPositionInPixels,
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

        // console.log({
        //     scrollLeftOfScrollableDiv: scrollLeftOfScrollableDiv,
        // });

        const clickPositionInTimelineUnits =
            mouseClickViewportPositionX -
            offSetLeftFromViewPortOfScrollableDivParent +
            scrollLeftOfScrollableDiv;

        setPlayheadPositionInPixels(clickPositionInTimelineUnits);

        const seekPosition = convertTimelineUnitsToTimecode(
            clickPositionInTimelineUnits,
            rulerWidth,
            durationSeconds
        );

        seekInMedia(seekPosition);
    };

    // Use composition instead of prop drilling?
    const selectTrack = (trackName: TimelineTrackName) => {
        setTimelineTrackName(trackName);
    };

    const getSelectedClass = (name: TimelineTrackName) =>
        timelineTrackName === name ? 'selected' : '';

    return (
        <>
            <Box>Playhead: {playheadPositionInPixels}</Box>
            <Box>Ruler Width: {rulerWidth}</Box>
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
                sx={{ height: `${3 * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS + 10}px` }}
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
                    {timelineTracks.map(({ name, trackLabel }) => (
                        <StyledTrackLabel
                            key={name}
                            id={name}
                            sx={{ fontSize: '10px' }}
                            // remove stylesheet when a new solution is found
                            className={`${getSelectedClass(name)}`}
                            onClick={() => selectTrack(name)}
                        >
                            {/* TODO need an icon here for annotations */}
                            {trackLabel}
                        </StyledTrackLabel>
                    ))}
                </Box>
                <Box
                    data-testid="tracks-container"
                    sx={{ flexGrow: 1, width: '94%', position: 'relative' }}
                >
                    <ScrollingBox
                        ref={scrollingBoxRef}
                        sx={{ height: `${3 * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS + 20}px` }}
                        data-testid="scroll-container"
                    >
                        <StyledScrolledTrack
                            data-testid="timeline-ruler"
                            sx={{ width: `${rulerWidth}px` }}
                            onClick={handleSeek}
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
                            <EditorInPoint
                                ref={inPointRef}
                                data-testid="editor-selected-in-point"
                                sx={{
                                    height: `${
                                        numberOfTracksDisplayed * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS
                                    }px`,
                                    left: `${inPointPositionInPixels}px`,
                                }}
                            />
                            <EditorOutPoint
                                ref={outPointRef}
                                data-testid="editor-selected-out-point"
                                sx={{
                                    height: `${
                                        numberOfTracksDisplayed * EDITOR_SOUND_BAR_HEIGHT_IN_PIXELS
                                    }px`,
                                    left: `${outPointPositionInPixels}px`,
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
                                        setRulerWidth={setRulerWidth}
                                    />
                                ) : null}
                            </StyledTimelineRulerBox>
                        </StyledScrolledTrack>
                        {!isNullOrUndefined(rulerWidth) && timelineTracks.length !== 0
                            ? timelineTracks.map(({ name, trackLabel, timelineTrack }) => (
                                  <StyledScrolledTrack
                                      key={trackLabel}
                                      data-testid={`${trackLabel}-track`}
                                      sx={{
                                          width: `${rulerWidth}px`,
                                          // backgroundImage: `url(${WAVE_FORM_URL})`,
                                      }}
                                  >
                                      {timelineTrack.map((timeRangeClip) => (
                                          <RangeBar
                                              key={JSON.stringify(timeRangeClip.timeRangeSeconds)}
                                              rulerWidth={rulerWidth}
                                              timeRangeClip={timeRangeClip}
                                              durationSeconds={durationSeconds}
                                          />
                                      ))}
                                  </StyledScrolledTrack>
                              ))
                            : null}
                    </ScrollingBox>
                </Box>
            </StyledTimelineBox>
        </>
    );
};
