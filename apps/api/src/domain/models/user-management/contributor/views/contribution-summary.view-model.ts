import { NestedDataType, NonEmptyString, NonNegativeFiniteNumber } from '@coscrad/data-types';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DTO } from '../../../../../types/DTO';
import { CoscradDate } from '../../utilities';

/**
 * Note that this is not the "canonical view" for a contributor. Rather, this is
 * the view that is used when joining (eagerly in the event consumers) contribution
 * info into resource views.
 */
export class ContributionSummary {
    @NonEmptyString({
        label: 'contributor IDs',
        description:
            'system references identifying who contributed to the creation or editing of this resource',
    })
    contributorIds: AggregateId[];

    @NonEmptyString({
        label: 'statement',
        description: 'a statement of this contribution to serve as attribution',
    })
    statement: string;

    @NonEmptyString({
        label: 'contribution type',
        description: 'system identifier for type of the',
    })
    type: string;

    @NestedDataType(CoscradDate, {
        label: 'date of record',
        description: 'the date the data update was made',
    })
    date: CoscradDate;

    /**
     * Note that this is denormalized to save the client the work of parsing
     * timestamps. Currently, we still sort on the client, but in the future
     * we should do that on the server as well.
     */
    @NonNegativeFiniteNumber({
        label: 'timestamp',
        description: 'a unix timestamp for the purpose of sorting events',
    })
    timestamp: number;

    constructor(dto: DTO<ContributionSummary>) {
        if (!dto) return;

        const { contributorIds, statement, type, date } = dto;

        this.contributorIds = contributorIds;

        this.statement = statement;

        this.type = type;

        if (isNonEmptyObject(date)) {
            this.date = new CoscradDate(date);
        }
    }

    public static fromDto(dto: DTO<ContributionSummary>) {
        return new ContributionSummary(dto);
    }
}
