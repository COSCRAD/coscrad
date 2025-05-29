import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../command-handlers/base-update-command-handler';
import { BaseEvent } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import { AdditionalCreditsProvidedForResource } from './additional-credits-provided-for-resource.event';
import { ProvideAdditionalCreditsForResource } from './provide-additional-credits-for-resource.command';

@CommandHandler(ProvideAdditionalCreditsForResource)
export class ProvideAdditionalCreditsForResourceCommandHandler extends BaseUpdateCommandHandler<Resource> {
    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(
        instance: Resource,
        { contributionType, contributorIds }: ProvideAdditionalCreditsForResource
    ): ResultOrError<Resource> {
        const updated = instance.provideAdditionalCredits({
            type: contributionType,
            contributorIds,
        });

        return updated;
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Resource
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(
        payload: ProvideAdditionalCreditsForResource,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new AdditionalCreditsProvidedForResource(payload, eventMeta);
    }
}
