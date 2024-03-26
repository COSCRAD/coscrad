import { ExternalEnum, PositiveInteger, Year } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { isUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { InvalidDateError } from './invalid-date.error';

export enum Month {
    January = '01',
    February = '02',
    March = '03',
    April = '04',
    May = '05',
    June = '06',
    July = '07',
    August = '08',
    September = '09',
    October = '10',
    November = '11',
    December = '12',
}

export const intToMonth = (int: number): Maybe<Month> => {
    const searchResult = Object.values(Month).find(
        (monthNumberAsString) => parseInt(monthNumberAsString) === int
    );

    if (isUndefined(searchResult)) {
        return NotFound;
    }

    return searchResult;
};
export class CoscradDate extends BaseDomainModel {
    /**
     * TODO[https://www.pivotaltracker.com/story/show/187270553]
     * This should be @DayOfMonth()
     */
    @PositiveInteger({
        label: 'day of month',
        description: 'Day of Month',
    })
    readonly day: number;

    @ExternalEnum(
        {
            enumName: `Month`,
            enumLabel: `Month`,
            labelsAndValues: Object.entries(Month).map(([label, value]) => ({
                label,
                value,
            })),
        },
        {
            label: `month`,
            description: `a month of the year`,
        }
    )
    readonly month: Month;

    @Year({
        label: 'the year',
        description: 'The Year',
    })
    readonly year: number;

    constructor(dto: DTO<CoscradDate>) {
        super();

        if (!dto) return;

        const { day, month, year } = dto;

        this.day = day;

        this.month = month;

        this.year = year;
    }

    toString(): string {
        return `${this.day} ${this.month}, ${this.year}`;
    }

    static parseString(input: string): ResultOrError<CoscradDate> {
        // for now we only accept (YYYY-MM-DD) format
        const split = input.split('-');

        if (split.length !== 3) {
            return new InvalidDateError(input);
        }

        const [yearAsString, monthAsString, dayAsString] = split;

        const monthParseResult = intToMonth(parseInt(monthAsString));

        if (isNotFound(monthParseResult)) {
            return new InternalError(`failed to parse month: ${monthAsString} in date: ${input}`);
        }

        return new CoscradDate({
            day: parseInt(dayAsString),
            month: monthParseResult,
            year: parseInt(yearAsString),
        });
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/187270562]
     * We need to implement complex invariant validation that ensures
     * that the leap year rules are satisfied.
     */
}
