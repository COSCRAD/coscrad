import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Timeline } from './timeline';
import { Track } from './track';

const PROGRESS_BAR_HEIGHT = 30;

const EDITOR_SOUND_BAR_HEIGHT = 30;

const PARTICIPANTS = 2;

const RangeBar = styled('div')({
    top: `-${PROGRESS_BAR_HEIGHT * 2}px`,
    height: `${PROGRESS_BAR_HEIGHT}px`,
    width: '0px',
    backgroundColor: 'black',
    borderLeft: '1px solid red',
    borderRadius: '0px',
    position: 'relative',
    visibility: 'hidden',
    zIndex: 500,
});

const SoundEditor = styled('div')({
    width: '100%',
    overflowX: 'scroll',
});

const SoundTracksContainer = styled('div')({
    backgroundColor: '#ccc',
    padding: '7px 2px',
    display: 'block',
    position: 'relative',
});

const EditorPlayhead = styled('div')({
    height: `${EDITOR_SOUND_BAR_HEIGHT}px`,
    width: '1px',
    backgroundColor: 'red',
    position: 'absolute',
    zIndex: 500,
});

interface CoscradLinearProgressBarProps {
    buffer: number;
    progress: number;
    inPointMilliseconds: number | null;
    outPointMilliseconds: number | null;
    mediaDuration: number;
    seekInProgressBar: (progressSelected: number) => void;
}

export const CoscradMediaEditor = ({
    buffer,
    progress,
    inPointMilliseconds,
    outPointMilliseconds,
    mediaDuration,
    seekInProgressBar,
}: CoscradLinearProgressBarProps) => {
    // Consider breaking out progress bar colours as customizable theme palettes

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    /* TODO: resolve non-null-assertion lint issue */

    const [rangeBar, setRangeBar] = useState({
        start: '',
        width: '',
    });

    const rangeBarRef = useRef<HTMLDivElement>(null);

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

    const timeline = useMemo(() => {
        return <Timeline duration={mediaDuration} />;
    }, [mediaDuration]);

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
                `Outpoint - start: ${start} width: ${width} progress: ${progress} end: ${end}`
            );

            rangeBarRef.current!.style.borderRight = '1px solid red';
        }

        rangeBarRef.current!.style.visibility = 'visible';
    }, [inPointMilliseconds, outPointMilliseconds]);

    return (
        <SoundEditor>
            {/* Set container height by length of participants array */}
            <SoundTracksContainer
                sx={{
                    height: `${PARTICIPANTS * EDITOR_SOUND_BAR_HEIGHT + 10}px`,
                    width: `${mediaDuration * 4}px`,
                }}
            >
                <EditorPlayhead
                    sx={{
                        height: `${PARTICIPANTS * EDITOR_SOUND_BAR_HEIGHT + 8}px`,
                        left: `${progress}%`,
                    }}
                />
                {mediaDuration > 0 ? timeline : null}
                <Track
                    width={`${mediaDuration * 4}px`}
                    height={`${EDITOR_SOUND_BAR_HEIGHT + 2}px`}
                    trackColor={'#7ab1b7'}
                />
                <Track
                    width={`${mediaDuration * 4}px`}
                    height={`${EDITOR_SOUND_BAR_HEIGHT + 2}px`}
                    trackColor={'#b77aad'}
                />
            </SoundTracksContainer>
        </SoundEditor>
    );
};
