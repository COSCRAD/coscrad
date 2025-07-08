import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateTag } from './create-tag.command';

export type TagCreatedPayload = CreateTag;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<TagCreated>({
    example: {
        type: 'TAG_CREATED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.tag,
                id: buildDummyUuid(2),
            },
            label: 'plants',
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(4),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('TAG_CREATED')
export class TagCreated extends BaseEvent<TagCreatedPayload> {
    readonly type = 'TAG_CREATED';
}
