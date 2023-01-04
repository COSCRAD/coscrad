import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER } from '../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemPublished } from './media-item-published.event';
import { PublishMediaItem } from './publish-media-item.command';

/**
 * This command is deprecated and will be removed in favour of `PUBLISH_RESOURCE`.
 *
 * TODO[https://www.pivotaltracker.com/story/show/184111389]
 * Remove this command handler once the new command has been written.
 */
// @CommandHandler(PublishMediaItem)
export class PublishMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    protected readonly aggregateType = ResourceType.mediaItem;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<MediaItem>;

    constructor(
        @Inject(REPOSITORY_PROVIDER) protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<MediaItem>(
            ResourceType.mediaItem
        );
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
