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
import { DeleteResource } from './delete-resource.command';
import { ResourceDeleted } from './resource-deleted.event';

@CommandHandler(DeleteResource)
export class DeleteResourceCommandHandler extends BaseUpdateCommandHandler<Resource> {
    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat());
    }

    protected actOnInstance(instance: Resource, _command: DeleteResource): ResultOrError<Resource> {
        return instance.delete();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Resource
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(payload: DeleteResource, eventMeta: EventRecordMetadata): BaseEvent {
        return new ResourceDeleted(payload, eventMeta);
    }
}
