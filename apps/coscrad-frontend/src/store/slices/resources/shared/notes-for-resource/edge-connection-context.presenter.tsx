import {
    EdgeConnectionContextType,
    IEdgeConnectionContext,
    IPageRangeContext,
    ITimeRangeContext,
} from '@coscrad/api-interfaces';
import { isInteger, isNonNegativeFiniteNumber } from '@coscrad/validation-constraints';
import { Box, Typography, styled } from '@mui/material';
import { convertMillisecondsToSeconds } from '../../../../../components/resources/utils/math';

/**
 * TODO Import this from a separate `Math` library. This implementation has
 * been copied from `@coscrad/media-player` temporarily.
 *
 * @param timeInSeconds non-negative finite number of seconds
 * @returns string formatted as media timecode HH:MM:SS
 */
const asFormattedMediaTimecodeString = (timeInSeconds: number): string => {
    const ninetynineHoursInSecondsMaximum = 99 * 60 * 60;

    // this is also copied from
    const asTwoDigitString = (inputNumber: number) => {
        if (
            !isNonNegativeFiniteNumber(inputNumber) ||
            !isInteger(inputNumber) ||
            inputNumber.toString().length > 2
        ) {
            throw new Error(
                'inputNumber must be a non-negative finite integer that is less than 100'
            );
        }

        const inputAsString = inputNumber.toString();

        return inputNumber > 9 ? inputAsString : `0${inputAsString}`;
    };

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

    const seconds = Math.floor(timeInSeconds - hours * numberOfSecondsInHour - minutes * 60);

    const formattedMediaTimecodeString = [hours, minutes, seconds]
        .map((time) => asTwoDigitString(time))
        .join(':');

    return formattedMediaTimecodeString;
};

const TimeRangeContextVisual = (): JSX.Element => (
    <Box
        component="span"
        sx={{
            height: '20px',
            width: '70px',
            backgroundColor: '#75ecff',
            borderRight: '1px solid #0671ff',
            borderLeft: '1px solid #0671ff',
            borderRadius: '5px',
            display: 'inline-block',
            ml: 1,
            mr: 1,
        }}
    />
);

const HiddenData = styled('div')({
    visibility: 'hidden',
    height: 0,
    width: 0,
});

interface EdgeConnectionContextPresenterProps {
    context: IEdgeConnectionContext;
}

/**
 * NOTE: This presenter is a temporary step before properly implementing
 * context using a `noteContext` in the base resource detail view props interface and
 * binding to this in concrete detail views (e.g., by highlighting a selected page).
 */
export const EdgeConnectionContextPresenter = ({
    context,
}: EdgeConnectionContextPresenterProps): JSX.Element => {
    const { type } = context;

    /**
     * TODO This is fine for now, but if we keep this presenter, we will want
     * to find a pattern that is more extensible to adding new \ custom
     * context types. This is very similar to getting rid of the switch statements
     * \ lookup tables in detail presenter factories, for example, and is a
     * manifestation of the expression problem. We'd prefer to be extensible
     * to adding new subtypes, not adding new functionality, in this case.
     */
    if (type === EdgeConnectionContextType.general) {
        return <Typography variant="body1">General</Typography>;
    }

    if (type === EdgeConnectionContextType.timeRange) {
        const {
            timeRange: { inPointMilliseconds, outPointMilliseconds },
        } = context as ITimeRangeContext;

        return (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Typography component="span" variant="body1" sx={{ mr: 1 }}>
                    Time Range:
                </Typography>
                <HiddenData data-testid="self-note-time-range-context">
                    {JSON.stringify({
                        inPointMilliseconds: inPointMilliseconds,
                        outPointMilliseconds: outPointMilliseconds,
                    })}
                </HiddenData>
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(inPointMilliseconds))}
                <TimeRangeContextVisual />
                {asFormattedMediaTimecodeString(convertMillisecondsToSeconds(outPointMilliseconds))}
            </Box>
        );
    }

    if (type === EdgeConnectionContextType.pageRange) {
        const { pageIdentifiers } = context as IPageRangeContext;

        return (
            <Box>
                <Typography component="span" variant="body1" sx={{ mr: 1 }}>
                    Page Range:
                </Typography>
                {pageIdentifiers.map((pageIdentifier) => (
                    <Typography component="span" variant="body1" key={pageIdentifier}>
                        {pageIdentifier}
                    </Typography>
                ))}
            </Box>
        );
    }

    return <Typography>{JSON.stringify(context)}</Typography>;
};
