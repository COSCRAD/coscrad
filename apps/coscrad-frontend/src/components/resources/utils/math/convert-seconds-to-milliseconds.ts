const MILLISECONDS_PER_SECOND = 1000;

export const convertSecondsToMilliseconds = (seconds: number): number =>
    Math.round(seconds * MILLISECONDS_PER_SECOND);

export const convertMillisecondsToSecondsRounded = (milliseconds: number): number =>
    Math.round((milliseconds / MILLISECONDS_PER_SECOND + Number.EPSILON) * 100) / 100;
