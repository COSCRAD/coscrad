import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { styled } from '@mui/material';
import { useEffect, useRef, useState } from 'react';

const LinearProgressBarContainer = styled('div')({
    height: '10px',
    width: '100%',
    backgroundColor: '#ccc',
});

const LinearProgressBar = styled('div')({
    height: '10px',
    width: '0%',
    position: 'relative',
});

const RangeBar = styled('div')({
    top: '-20px',
    height: '10px',
    width: '0px',
    backgroundColor: 'black',
    borderLeft: '4px solid red',
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

    useEffect(() => {
        if (!isNullOrUndefined(inPointMilliseconds) && !isNullOrUndefined(outPointMilliseconds)) {
            const start = (inPointMilliseconds / mediaDuration) * 100;

            // console.log(`start: ${start} = in: ${inPointMilliseconds} / dur: ${mediaDuration}`);

            const width = ((outPointMilliseconds - inPointMilliseconds) / mediaDuration) * 100;

            setRangeBar({ start: `${start}%`, width: `${width}%` });

            rangeBarRef.current!.style.borderRight = '4px solid red';

            return;
        }

        if (isNullOrUndefined(inPointMilliseconds)) return;

        const start = (inPointMilliseconds / mediaDuration) * 100;

        console.log(`start: ${start}% = in: ${inPointMilliseconds} / dur: ${mediaDuration}`);

        setRangeBar({ start: `${start}%`, width: `3px` });

        rangeBarRef.current!.style.visibility = 'visible';
    }, [inPointMilliseconds, outPointMilliseconds]);

    return (
        <LinearProgressBarContainer onClick={(event) => handleSeekInProgressBar(event)}>
            <LinearProgressBar sx={{ width: `${buffer}%`, backgroundColor: 'info.main' }} />
            <LinearProgressBar
                sx={{
                    top: '-10px',
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
