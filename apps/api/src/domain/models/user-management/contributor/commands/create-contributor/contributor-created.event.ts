import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { CoscradDate } from '../../../utilities';
import { CreateContributor } from './create-contributor.command';

export type ContributorCreatedPayload = Omit<CreateContributor, 'dateOfBirth'> & {
    dateOfBirth?: CoscradDate;
};

const testEventId = buildDummyUuid(1);

@CoscradDataExample<ContributorCreated>({
    example: {
        type: 'CONTRIBUTOR_CREATED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.contributor,
                id: buildDummyUuid(3),
            },
            firstName: 'Arnie',
            lastName: 'Plunker',
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(4),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('CONTRIBUTOR_CREATED')
export class ContributorCreated extends BaseEvent<ContributorCreatedPayload> {
    readonly type = 'CONTRIBUTOR_CREATED';
}
