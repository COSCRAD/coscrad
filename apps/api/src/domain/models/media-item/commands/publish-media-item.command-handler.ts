import { CommandHandler } from '../../../../../../../libs/commands/src';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../lib/types/not-found';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import { IEvent } from '../../shared/events/interfaces/event.interface';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemPublished } from './media-item-published.event';
import { PublishMediaItem } from './publish-media-item.command';

@CommandHandler(PublishMediaItem)
export class PublishMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    protected async fetchInstanceToUpdate({
        id,
    }: PublishMediaItem): Promise<ResultOrError<MediaItem>> {
        const searchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchById(id);

        if (isNotFound(searchResult))
            return new CommandExecutionError([
                new InternalError(`There is no media item with the id: ${id}`),
            ]);

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
