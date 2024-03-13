import { Month, PositiveInteger, Year } from '@coscrad/data-types';
import BaseDomainModel from '../../BaseDomainModel';

export class CoscradDate extends BaseDomainModel {
    @PositiveInteger({
        label: 'day of month',
        description: 'Day of Month',
    })
    readonly day: number;

    @Month({
        label: 'month of the year',
        description: 'Month of the Year',
    })
    readonly month: typeof Month;

    @Year({
        label: 'the year',
        description: 'The Year',
    })
    readonly year: number;

    toString(): string {
        return `${(this.day, this.month, this.year)}`;
    }
}
