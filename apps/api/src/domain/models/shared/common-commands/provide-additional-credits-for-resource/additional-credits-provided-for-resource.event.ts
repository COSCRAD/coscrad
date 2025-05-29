import { CoscradEvent } from '../../../../../domain/common';
import { BaseEvent } from '../../events/base-event.entity';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';

export type AdditionalCreditsProvidedForResourcePayload = ProvideAdditionalCreditsForResource;

@CoscradEvent('ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE')
export class AdditionalCreditsProvidedForResource extends BaseEvent<AdditionalCreditsProvidedForResourcePayload> {
    readonly type = 'ADDITIONAL_CREDITS_PROVIDED_FOR_RESOURCE';
}
