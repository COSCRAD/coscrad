import { isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import { asTwoDigitString } from './as-two-digit-string';

/**
 *
 * @param timeInSeconds non-negative finite number
 * @returns string formatted as media timecode HH:MM:SS
 */
export const asFormattedMediaTimecodeString = (timeInSeconds: number): string => {
    if (!isNonNegativeFiniteNumber(timeInSeconds)) {
        throw new Error('timeInSeconds must be a non-negative finite number');
    }

    const numberOfSecondsInHour = 3600;

    const hours =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor(timeInSeconds / numberOfSecondsInHour)
            : 0;

    console.log({ hours });

    const minutes =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor(timeInSeconds - (hours * numberOfSecondsInHour) / 60)
            : Math.floor(timeInSeconds / 60);

    console.log({ minutes });

    const seconds = Math.floor(timeInSeconds - hours * numberOfSecondsInHour - minutes * 60);

    console.log({ seconds });

    const formattedCurrentTime = [hours, minutes, seconds]
        .map((time) => asTwoDigitString(time))
        .join(':');

    return formattedCurrentTime;
};
