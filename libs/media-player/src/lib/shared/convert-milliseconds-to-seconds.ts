const MILLISECONDS_PER_SECOND = 1000;

export const convertMillisecondsToSecondsRounded = (milliseconds: number): number =>
    Math.round((milliseconds / MILLISECONDS_PER_SECOND + Number.EPSILON) * 100) / 100;

export const convertMillisecondsToSeconds = (milliseconds: number): number =>
    milliseconds / MILLISECONDS_PER_SECOND;
