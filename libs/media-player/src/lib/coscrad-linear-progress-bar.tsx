import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const LinearProgressBarContainer = styled('div')({
    height: '30px',
    width: '100%',
    backgroundColor: '#ccc',
    borderRadius: '5px',
});

const LinearProgressBar = styled('div')({
    height: '30px',
    width: '0%',
    position: 'relative',
    borderRadius: '5px',
});

const RangeBar = styled('div')({
    top: '-60px',
    height: '30px',
    width: '0px',
    backgroundColor: 'black',
    borderLeft: '4px solid red',
    borderRadius: '5px',
    opacity: '0.6',
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
        const progressSelected =
            (event.clientX - event.currentTarget.offsetLeft) / event.currentTarget.offsetWidth;

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
        if (!isNullOrUndefined(inPointMilliseconds) && !isNullOrUndefined(outPointMilliseconds)) {
            const start = (inPointMilliseconds / mediaDuration) * 100;

            const end = (outPointMilliseconds / mediaDuration) * 100;

            const width = end - start;

            setRangeBar({ ...rangeBar, width: `${width}%` });

            console.log(`start: ${start} width: ${width} progress: ${progress} end: ${end}`);

            rangeBarRef.current!.style.borderRight = '4px solid red';

            return;
        }

        if (isNullOrUndefined(inPointMilliseconds)) {
            clearRangeBar();

            return;
        }

        const start = (inPointMilliseconds / mediaDuration) * 100;

        console.log(`start: ${start}% = in: ${inPointMilliseconds} / dur: ${mediaDuration}`);

        setRangeBar({ start: `${start}%`, width: `2px` });

        rangeBarRef.current!.style.visibility = 'visible';
    }, [inPointMilliseconds, outPointMilliseconds]);

    return (
        <LinearProgressBarContainer onClick={(event) => handleSeekInProgressBar(event)}>
            <LinearProgressBar sx={{ width: `${buffer}%`, backgroundColor: 'info.main' }} />
            <LinearProgressBar
                sx={{
                    top: '-30px',
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
