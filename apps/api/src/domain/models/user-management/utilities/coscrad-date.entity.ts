import { ExternalEnum, PositiveInteger, Year } from '@coscrad/data-types';
import { DTO } from '../../../../types/DTO';
import BaseDomainModel from '../../BaseDomainModel';

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

    /**
     * TODO [https://www.pivotaltracker.com/story/show/187270562]
     * We need to implement complex invariant validation that ensures
     * that the leap year rules are satisfied.
     */
}
