import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { MediaItem } from '../entities/media-item.entity';
import { MediaItemPublished } from './media-item-published.event';
import { PublishMediaItem } from './publish-media-item.command';

@CommandHandler(PublishMediaItem)
export class PublishMediaItemCommandHandler extends BaseUpdateCommandHandler<MediaItem> {
    protected readonly resourceType = ResourceType.mediaItem;

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

    protected eventFactory(command: PublishMediaItem, eventId: string): BaseEvent {
        return new MediaItemPublished(command, eventId);
    }
}
