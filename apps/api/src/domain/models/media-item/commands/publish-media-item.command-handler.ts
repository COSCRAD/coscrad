import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemPublished } from './media-item-published.event';
import { PublishMediaItem } from './publish-media-item.command';

@CommandHandler(PublishMediaItem)
export class PublishMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    protected readonly aggregateType = ResourceType.mediaItem;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<MediaItem>;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<MediaItem>(
            ResourceType.mediaItem
        );
    }

    protected getAggregateIdFromCommand({ id }: PublishMediaItem): string {
        return id;
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        // This command has no external state requirements
        return Promise.resolve(buildInMemorySnapshot({}));
    }

    protected validateExternalState(_: InMemorySnapshot, __: MediaItem): InternalError | Valid {
        return Valid;
    }

    protected actOnInstance(instance: MediaItem): ResultOrError<MediaItem> {
        return instance.publish();
    }

    protected buildEvent(
        command: PublishMediaItem,
        eventId: string,
        systemUserId: AggregateId
    ): BaseEvent {
        return new MediaItemPublished(command, eventId, systemUserId);
    }
}
