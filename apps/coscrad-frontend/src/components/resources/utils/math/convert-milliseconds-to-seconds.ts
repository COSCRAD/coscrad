const MILLISECONDS_PER_SECOND = 1000;

export const convertMillisecondsToSeconds = (milliseconds: number): number =>
    Math.round(milliseconds / MILLISECONDS_PER_SECOND);
