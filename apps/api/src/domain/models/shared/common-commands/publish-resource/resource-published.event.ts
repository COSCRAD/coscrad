import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../events/base-event.entity';
import { PublishResource } from './publish-resource.command';

export type ResourcePublishedPayload = PublishResource;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<ResourcePublished>({
    example: {
        type: 'RESOURCE_PUBLISHED',
        id: testEventId,
        meta: {
            id: testEventId,
            userId: buildDummyUuid(2),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.song,
                id: buildDummyUuid(3),
            },
        },
    },
})
@CoscradEvent(`RESOURCE_PUBLISHED`)
export class ResourcePublished extends BaseEvent<ResourcePublishedPayload> {
    readonly type = 'RESOURCE_PUBLISHED';
}
