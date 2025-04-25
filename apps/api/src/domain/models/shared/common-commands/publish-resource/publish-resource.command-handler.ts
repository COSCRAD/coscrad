import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Resource } from '../../../resource.entity';
import { BaseUpdateCommandHandler } from '../../command-handlers/base-update-command-handler';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../../events/base-event.entity';
import { EventRecordMetadata } from '../../events/types/EventRecordMetadata';
import { PublishResource } from './publish-resource.command';
import { ResourcePublished } from './resource-published.event';

@CommandHandler(PublishResource)
export class PublishResourceCommandHandler extends BaseUpdateCommandHandler<Resource> {
    protected async createOrFetchWriteContext({
        aggregateCompositeIdentifier: { type: resourceType, id },
    }: PublishResource): Promise<ResultOrError<Resource>> {
        const searchResult = await this.repositoryProvider.forResource(resourceType).fetchById(id);

        if (isNotFound(searchResult)) {
            return new AggregateNotFoundError({ type: resourceType, id });
        }

        return searchResult;
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(_: InMemorySnapshot, __: Resource): Valid | InternalError {
        return Valid;
    }

    // There is no information on the payload required here.
    protected actOnInstance(instance: Resource, _: ICommand): ResultOrError<Resource> {
        return instance.publish();
    }

    protected buildEvent(command: PublishResource, eventMeta: EventRecordMetadata): BaseEvent {
        return new ResourcePublished(command, eventMeta);
    }
}
