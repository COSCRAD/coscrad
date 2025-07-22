import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { RelabelTag } from './relabel-tag.command';

export type TagRelabelledPayload = RelabelTag;

const testEventId = buildDummyUuid(45);

@CoscradDataExample<TagRelabelled>({
    example: {
        type: 'TAG_RELABELLED',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: { id: buildDummyUuid(54), type: AggregateType.tag },
            newLabel: 'my updated label',
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(7),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('TAG_RELABELLED')
export class TagRelabelled extends BaseEvent<TagRelabelledPayload> {
    readonly type = 'TAG_RELABELLED';
}
