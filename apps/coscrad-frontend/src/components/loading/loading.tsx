import { useEffect, useState } from 'react';

const MAX_NUMBER_OF_DOTS = 3;

const DOT_RATE = 1500; // rate dots are added in milliseconds

const DOT_CHAR = '.';

type LoadingState = number;

export const Loading = (): JSX.Element => {
    const [numberOfDots, setNumberOfDots] = useState<LoadingState>(0);

    useEffect(() => {
        setTimeout(() => {
            setNumberOfDots((numberOfDots + 1) % (MAX_NUMBER_OF_DOTS + 1));
        }, DOT_RATE);
    }, [numberOfDots]);

    return <div data-testid="loading">Loading {DOT_CHAR.repeat(numberOfDots)}</div>;
};
