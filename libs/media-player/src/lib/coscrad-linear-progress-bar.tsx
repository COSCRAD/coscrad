import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const PROGRESS_BAR_HEIGHT = 30;

const LinearProgressBarContainer = styled('div')({
    height: `${PROGRESS_BAR_HEIGHT}px`,
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: '5px',
});

const LinearProgressBar = styled('div')({
    height: `${PROGRESS_BAR_HEIGHT}px`,
    width: '0%',
    position: 'relative',
    borderRadius: '5px',
});

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

interface CoscradLinearProgressBarProps {
    buffer: number;
    progress: number;
    inPointMilliseconds: number | null;
    outPointMilliseconds: number | null;
    mediaDuration: number;
    seekInProgressBar: (progressSelected: number) => void;
}

export const CoscradLinearProgressBar = ({
    buffer,
    progress,
    inPointMilliseconds,
    outPointMilliseconds,
    mediaDuration,
    seekInProgressBar,
}: CoscradLinearProgressBarProps) => {
    // Consider breaking out progress bar colours as customizable theme palettes

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
        <LinearProgressBarContainer onClick={(event) => handleSeekInProgressBar(event)}>
            <LinearProgressBar sx={{ width: `${buffer}%`, backgroundColor: 'info.main' }} />
            <LinearProgressBar
                sx={{
                    top: `-${PROGRESS_BAR_HEIGHT}px`,
                    width: `${progress}%`,
                    backgroundColor: 'primary.main',
                }}
            />
            <RangeBar ref={rangeBarRef} sx={{ left: rangeBar.start, width: rangeBar.width }} />
            {/* <Typography variant="body1">
                Start: {rangeBar.start}, Width: {rangeBar.width}
            </Typography> */}
        </LinearProgressBarContainer>
    );
};
