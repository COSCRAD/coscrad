import { CommandHandler, ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Resource } from '../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import { ResourceUnpublished } from './resource-unpublished.event';
import { UnpublishResource } from './unpublish-resource.command';

@CommandHandler(UnpublishResource)
export class UnpublishResourceCommandHandler extends BaseUpdateCommandHandler<Resource> {
    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(instance: Resource, _: ICommand): ResultOrError<Resource> {
        return instance.unpublish();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Resource
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        payload: UnpublishResource,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        return new ResourceUnpublished(payload, eventMeta);
    }
}
