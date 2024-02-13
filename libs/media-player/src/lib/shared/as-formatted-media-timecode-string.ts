import { asTwoDigitString } from './as-two-digit-string';
import { isNonNegativeFiniteNumber } from './validation';

/**
 * TODO Import this from a separate `Math` library.
 *
 * @param timeInSeconds non-negative finite number of seconds
 * @returns string formatted as media timecode HH:MM:SS
 */
export const asFormattedMediaTimecodeString = (timeInSeconds: number): string => {
    const ninetynineHoursInSecondsMaximum = 99 * 60 * 60;

    if (
        !isNonNegativeFiniteNumber(timeInSeconds) ||
        timeInSeconds >= ninetynineHoursInSecondsMaximum
    ) {
        throw new Error(
            [
                'timeInSeconds must be a non-negative finite number',
                'representing a duration of less than 99 hours',
            ].join(' ')
        );
    }

    const numberOfSecondsInHour = 3600;

    const hours =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor(timeInSeconds / numberOfSecondsInHour)
            : 0;

    const minutes =
        timeInSeconds >= numberOfSecondsInHour
            ? Math.floor((timeInSeconds - hours * numberOfSecondsInHour) / 60)
            : Math.floor(timeInSeconds / 60);

    const seconds = timeInSeconds - hours * numberOfSecondsInHour - minutes * 60;

    const secondsRoundedToThreeDecimals = Math.round((seconds + Number.EPSILON) * 100) / 100;

    const formattedHoursAndMinutesAsString = [hours, minutes]
        .map((time) => asTwoDigitString(time))
        .join(':');

    const formattedMediaTimecodeString = formattedHoursAndMinutesAsString.concat(
        `:${secondsRoundedToThreeDecimals.toString()}`
    );

    return formattedMediaTimecodeString;
};
