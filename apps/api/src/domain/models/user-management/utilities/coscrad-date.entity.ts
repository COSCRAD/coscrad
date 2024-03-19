import { ExternalEnum, PositiveInteger, Year } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Maybe } from '../../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../../lib/types/not-found';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { isUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../BaseDomainModel';
import { DayOfMonthTooLargeError } from './day-of-month-too-large.error';
import { InvalidDateError } from './invalid-date.error';
import { NotALeapYearError } from './not-a-leap-year.error';

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

const daysInMonthNonLeapYear: { [K in Month]: number } = {
    [Month.January]: 31,
    [Month.February]: 28,
    [Month.March]: 31,
    [Month.April]: 30,
    [Month.May]: 31,
    [Month.June]: 30,
    [Month.July]: 31,
    [Month.August]: 31,
    [Month.September]: 30,
    [Month.October]: 31,
    [Month.November]: 30,
    [Month.December]: 31,
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

    validateComplexInvariants(): InternalError[] {
        if (this.month === Month.February && this.day === 29) {
            if (!this.isLeapYear()) {
                return [new NotALeapYearError(this.year)];
            }
        }

        // at this point, we know we are not dealing with February 29 on a leap year
        const lastDayOfMonth = daysInMonthNonLeapYear[this.month];

        if (this.day > lastDayOfMonth) {
            return [new DayOfMonthTooLargeError(this, lastDayOfMonth)];
        }

        return [];
    }

    private isLeapYear(): boolean {
        const { year } = this;

        if (year % 4 !== 0) {
            return false;
        }

        if (year % 400 === 0) {
            return true;
        }

        // We know that the year is divisble by 4 but not 400
        // So as long as the year is not divisible by 100, it's a leap year
        return year % 100 !== 0;
    }

    /**
     * TODO [https://www.pivotaltracker.com/story/show/187270562]
     * We need to implement complex invariant validation that ensures
     * that the leap year rules are satisfied.
     */
}
