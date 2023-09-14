import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { Typography, styled } from '@mui/material';
import { useEffect, useState } from 'react';

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
    // top: '-20px',
    height: '10px',
    width: '0px',
    backgroundColor: 'black',
    position: 'relative',
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

            return;
        }

        if (isNullOrUndefined(inPointMilliseconds)) return;

        const start = (inPointMilliseconds / mediaDuration) * 100;

        console.log(`start: ${start}% = in: ${inPointMilliseconds} / dur: ${mediaDuration}`);

        setRangeBar({ start: `${start}%`, width: `2px` });
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
            <RangeBar sx={{ left: rangeBar.start, width: rangeBar.width }} />
            <Typography variant="body1">
                Start: {rangeBar.start}, Width: {rangeBar.width}
            </Typography>
        </LinearProgressBarContainer>
    );
};
