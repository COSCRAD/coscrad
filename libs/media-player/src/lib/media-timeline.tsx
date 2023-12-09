import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Box, Grid, styled } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
    EDITOR_HORIZONTAL_PADDING,
    EDITOR_SOUND_BAR_HEIGHT,
    NUMBER_OF_TRACKS,
    TIMELINE_RULER_BAR_HEIGHT,
    ZOOM_FACTOR,
} from './media-timeline-constants';
import { TimelineRuler } from './media-timeline-ruler';
import { Track } from './media-timeline-track';

// const RangeBar = styled('div')({
//     top: `-${PROGRESS_BAR_HEIGHT * 2}px`,
//     height: `${PROGRESS_BAR_HEIGHT}px`,
//     width: '0px',
//     backgroundColor: 'black',
//     borderLeft: '1px solid red',
//     borderRadius: '0px',
//     position: 'relative',
//     visibility: 'hidden',
//     zIndex: 500,
// });

const SoundEditor = styled('div')({
    width: '100%',
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: '#424242',
});

const Initials = styled('div')({
    position: 'relative',
    padding: '4px 4px',
    color: '#fff',
    boxSizing: 'border-box',
    borderBottom: '2px dotted #ccc',
});

const ScrollingBox = styled('div')({
    overflowX: 'scroll',
    position: 'relative',
});

const ScrolledTracksBox = styled('div')({
    display: 'block',
    position: 'relative',
});

const TimelineRulerBox = styled('div')({
    marginBottom: '3px',
    borderBottom: '1px solid #4914db',
    boxSizing: 'border-box',
    position: 'relative',
});

// This doesn't work, but may have some hints to smoothing playhead movement
// const movePlayhead = keyframes`
//     0 %  { left: 0; },
//     25 %  { left: 25%; },
//     50 %  { left: 50%; },
//     75 %  { left: 75%; },
//     100 %  { left: 100%; }
// `;

const EditorPlayhead = styled('div')({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    width: '1px',
    backgroundColor: 'red',
    position: 'absolute',
    // animationName: `${movePlayhead}`,
    // animationDuration: '2s',
    // animationTimingFunction: 'ease-in',
    // animationIterationCount: 'infinite',
    zIndex: 500,
});

interface MediaTimelineProps {
    mediaDuration: number;
    playProgress: number;
    selectionStartMilliseconds: number;
    selectionEndMilliseconds: number;
}

export const MediaTimeline = ({
    mediaDuration,
    playProgress,
    selectionStartMilliseconds,
    selectionEndMilliseconds,
}: MediaTimelineProps) => {
    // Consider breaking out progress bar colours as customizable theme palettes

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    /* TODO: resolve non-null-assertion lint issue */

    const soundEditorRef = useRef<HTMLDivElement>(null);

    const tracksRef = useRef<HTMLDivElement>(null);

    const playheadRef = useRef<HTMLDivElement>(null);

    const [rangeSelectionBar, setRangeSelectionBar] = useState({
        start: '',
        width: '',
    });

    const scrolledTrackLength = mediaDuration * ZOOM_FACTOR;

    const trackHeight = EDITOR_SOUND_BAR_HEIGHT + 2;

    const rangeSelectionBarRef = useRef<HTMLDivElement>(null);

    const timeline = useMemo(() => {
        return <TimelineRuler duration={mediaDuration} zoomFactor={ZOOM_FACTOR} />;
    }, [mediaDuration]);

    const clearRangeBar = () => {
        if (!isNullOrUndefined(rangeSelectionBarRef.current))
            rangeSelectionBarRef.current.style.visibility = 'hidden';

        setRangeSelectionBar({
            start: '',
            width: '',
        });
    };

    useEffect(() => {
        const start = (selectionStartMilliseconds / mediaDuration) * 100;

        console.log(
            `Inpoint - start: ${start}% = in: ${selectionStartMilliseconds} / dur: ${mediaDuration}`
        );

        if (isNullOrUndefined(selectionEndMilliseconds))
            setRangeSelectionBar({ start: `${start}%`, width: `2px` });

        if (!isNullOrUndefined(selectionEndMilliseconds)) {
            const end = (selectionEndMilliseconds / mediaDuration) * 100;

            const width = end - start;

            setRangeSelectionBar({ ...rangeSelectionBar, width: `${width}%` });

            console.log(
                `Outpoint - start: ${start} width: ${width} progress: ${playProgress} end: ${end}`
            );

            rangeSelectionBarRef.current!.style.borderRight = '1px solid red';
        }

        rangeSelectionBarRef.current!.style.visibility = 'visible';
    }, [selectionStartMilliseconds, selectionEndMilliseconds]);

    useEffect(() => {
        const editorWidth = soundEditorRef.current!.getBoundingClientRect().width;

        const editorPadding = 2 * EDITOR_HORIZONTAL_PADDING;

        const editorMidPoint = (editorWidth - editorPadding) / 2;

        const playheadPosition = playheadRef.current!.offsetLeft;

        if (playheadPosition >= editorMidPoint) {
            const scrollLeft = playheadPosition - editorMidPoint;

            soundEditorRef.current!.scrollTo({
                top: 0,
                left: scrollLeft,
                behavior: 'smooth',
            });
        } else {
            soundEditorRef.current!.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth',
            });
        }
    }, [playProgress, scrolledTrackLength]);

    return (
        <SoundEditor ref={soundEditorRef}>
            <Grid container spacing={0}>
                <Grid
                    sx={{
                        paddingTop: `${TIMELINE_RULER_BAR_HEIGHT + 2}px`,
                    }}
                    item
                    xs={0.8}
                >
                    <Box sx={{ h: 4, w: 3 }}>*</Box>
                </Grid>
                <Grid item xs={11.2}>
                    <ScrollingBox>
                        <ScrolledTracksBox
                            ref={tracksRef}
                            sx={{
                                height: `${
                                    NUMBER_OF_TRACKS * EDITOR_SOUND_BAR_HEIGHT +
                                    TIMELINE_RULER_BAR_HEIGHT +
                                    10
                                }px`,
                                width: `${scrolledTrackLength}px`,
                            }}
                        >
                            <EditorPlayhead
                                ref={playheadRef}
                                sx={{
                                    height: `${
                                        NUMBER_OF_TRACKS * EDITOR_SOUND_BAR_HEIGHT +
                                        TIMELINE_RULER_BAR_HEIGHT +
                                        8
                                    }px`,
                                    left: `${playProgress}%`,
                                }}
                            />
                            <TimelineRulerBox
                                sx={{
                                    width: scrolledTrackLength,
                                    height: `${TIMELINE_RULER_BAR_HEIGHT}px`,
                                }}
                            >
                                {mediaDuration > 0 ? timeline : null}
                            </TimelineRulerBox>
                            {Array.from(Array(NUMBER_OF_TRACKS).keys()).map((trackNumber) => (
                                <Track
                                    key={trackNumber}
                                    width={scrolledTrackLength}
                                    height={trackHeight}
                                    mediaDuration={mediaDuration}
                                    selectionStartMilliseconds={selectionStartMilliseconds}
                                    selectionEndMilliseconds={selectionEndMilliseconds}
                                />
                            ))}
                        </ScrolledTracksBox>
                    </ScrollingBox>
                </Grid>
            </Grid>
        </SoundEditor>
    );
};
