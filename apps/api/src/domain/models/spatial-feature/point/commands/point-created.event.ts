import { AggregateType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { CreatePoint } from './create-point.command';

export type PointCreatedPayload = CreatePoint;

const testEventId = buildDummyUuid(41);

@CoscradDataExample<PointCreated>({
    example: {
        id: testEventId,
        type: 'POINT_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.spatialFeature,
                id: buildDummyUuid(14),
            },
            name: 'the chill spot',
            description: 'the best place to relax',
            lattitude: 123,
            longitude: 321,
        },
        meta: {
            userId: buildDummyUuid(444),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
@CoscradEvent('POINT_CREATED')
export class PointCreated extends BaseEvent<PointCreatedPayload> {
    readonly type = 'POINT_CREATED';
}
