const MILLISECONDS_PER_SECOND = 1000;

export const convertSecondsToMilliseconds = (seconds: number): number =>
    Math.round(seconds * MILLISECONDS_PER_SECOND);
