import { ResourceType } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../domain/common';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../events/base-event.entity';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';

export type AdditionalCreditsProvidedForResourcePayload = ProvideAdditionalCreditsForResource;

const fixtureEventId = buildDummyUuid(3);
@CoscradDataExample<AdditionalCreditsProvidedForResource>({
    example: {
        id: fixtureEventId,
        type: 'ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(1),
                type: ResourceType.audioItem,
            },
            contributionType: 'audio processed',
            contributorIds: [],
        },
        meta: {
            id: fixtureEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(5),
        },
    },
})
@CoscradEvent('ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE')
export class AdditionalCreditsProvidedForResource extends BaseEvent<AdditionalCreditsProvidedForResourcePayload> {
    readonly type = 'ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE';
}
