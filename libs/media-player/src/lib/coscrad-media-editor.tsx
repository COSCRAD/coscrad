import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TimelineRuler } from './timeline';
import { Track } from './track';
import { ITranscript } from './video-prototype-interfaces/transcript-interface';

const ZOOM_FACTOR = 40;

const PROGRESS_BAR_HEIGHT = 30;

const EDITOR_SOUND_BAR_HEIGHT = 30;

const EDITOR_X_PADDING = 10;

const TIMELINE_RULER_BAR_HEIGHT = 30;

const TRACK_COLORS = ['#5d868a', '#916a8a'];

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
    overflowX: 'scroll',
    padding: `0 ${EDITOR_X_PADDING}px`,
    position: 'relative',
    boxSizing: 'border-box',
    backgroundColor: '#424242',
});

const ScrolledTracksContainer = styled('div')({
    padding: '7px 0px',
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

interface CoscradLinearProgressBarProps {
    buffer: number;
    playProgress: number;
    inPointMilliseconds: number | null;
    outPointMilliseconds: number | null;
    mediaDuration: number;
    seekInProgressBar: (progressSelected: number) => void;
    transcript: ITranscript;
}

export const CoscradMediaEditor = ({
    buffer,
    playProgress,
    inPointMilliseconds,
    outPointMilliseconds,
    mediaDuration,
    seekInProgressBar,
    transcript,
}: CoscradLinearProgressBarProps) => {
    // Consider breaking out progress bar colours as customizable theme palettes

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    /* TODO: resolve non-null-assertion lint issue */

    const soundEditorRef = useRef<HTMLDivElement>(null);

    const tracksRef = useRef<HTMLDivElement>(null);

    const playheadRef = useRef<HTMLDivElement>(null);

    const [rangeBar, setRangeBar] = useState({
        start: '',
        width: '',
    });

    const scrolledTrackLength = mediaDuration * ZOOM_FACTOR;

    const trackHeight = EDITOR_SOUND_BAR_HEIGHT + 2;

    const rangeBarRef = useRef<HTMLDivElement>(null);

    const { participants, items } = transcript;

    const numberOfParticipants = participants.length;

    const timeline = useMemo(() => {
        return <TimelineRuler duration={mediaDuration} zoomFactor={ZOOM_FACTOR} />;
    }, [mediaDuration]);

    const handleSeekInProgressBar = (event: React.MouseEvent<HTMLSpanElement>) => {
        const progressBarElement = event.currentTarget;

        const { left: progressBarStartingPoint, width: progressBarWidth } =
            progressBarElement.getBoundingClientRect();

        const progressSelected = (event.clientX - progressBarStartingPoint) / progressBarWidth;

        seekInProgressBar(progressSelected);
    };

    const clearRangeBar = () => {
        if (!isNullOrUndefined(rangeBarRef.current))
            rangeBarRef.current.style.visibility = 'hidden';

        setRangeBar({
            start: '',
            width: '',
        });
    };

    useEffect(() => {
        if (isNullOrUndefined(inPointMilliseconds)) {
            clearRangeBar();

            return;
        }

        const start = (inPointMilliseconds / mediaDuration) * 100;

        console.log(
            `Inpoint - start: ${start}% = in: ${inPointMilliseconds} / dur: ${mediaDuration}`
        );

        if (isNullOrUndefined(outPointMilliseconds))
            setRangeBar({ start: `${start}%`, width: `2px` });

        if (!isNullOrUndefined(outPointMilliseconds)) {
            const end = (outPointMilliseconds / mediaDuration) * 100;

            const width = end - start;

            setRangeBar({ ...rangeBar, width: `${width}%` });

            console.log(
                `Outpoint - start: ${start} width: ${width} progress: ${playProgress} end: ${end}`
            );

            rangeBarRef.current!.style.borderRight = '1px solid red';
        }

        rangeBarRef.current!.style.visibility = 'visible';
    }, [inPointMilliseconds, outPointMilliseconds]);

    useEffect(() => {
        const editorWidth = soundEditorRef.current!.getBoundingClientRect().width;

        const editorPadding = 2 * EDITOR_X_PADDING;

        console.log({ editorWidth });

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
            <ScrolledTracksContainer
                ref={tracksRef}
                sx={{
                    height: `${
                        numberOfParticipants * EDITOR_SOUND_BAR_HEIGHT +
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
                            numberOfParticipants * EDITOR_SOUND_BAR_HEIGHT +
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
                {participants.map(({ initials }) => (
                    <Track
                        participantInitials={initials}
                        width={scrolledTrackLength}
                        height={trackHeight}
                    />
                ))}
            </ScrolledTracksContainer>
        </SoundEditor>
    );
};
