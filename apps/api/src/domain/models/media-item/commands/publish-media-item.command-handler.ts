import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import ResourceNotFoundError from '../../shared/common-command-errors/ResourceNotFoundError';
import { IEvent } from '../../shared/events/interfaces/event.interface';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemPublished } from './media-item-published.event';
import { PublishMediaItem } from './publish-media-item.command';

@CommandHandler(PublishMediaItem)
export class PublishMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        protected readonly resourceType: ResourceType
    ) {
        super(repositoryProvider, idManager, ResourceType.mediaItem);
    }

    protected async fetchInstanceToUpdate({
        id,
    }: PublishMediaItem): Promise<ResultOrError<MediaItem>> {
        const searchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchById(id);

        if (isNotFound(searchResult))
            return new ResourceNotFoundError({ type: ResourceType.mediaItem, id });

        return searchResult;
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

    protected eventFactory(command: PublishMediaItem, eventId: string): IEvent {
        return new MediaItemPublished(command, eventId);
    }
}
