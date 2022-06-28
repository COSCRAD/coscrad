import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import getInstanceFactoryForEntity from '../../../factories/getInstanceFactoryForEntity';
import { AggregateId } from '../../../types/AggregateId';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { ContributorAndRole } from '../../song/ContributorAndRole';
import { MediaItem } from '../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';
import { MediaItemCreated } from './media-item-created.event';

@CommandHandler(CreateMediaItem)
export class CreateMediaItemCommandHandler extends BaseCreateCommandHandler<MediaItem> {
    protected createNewInstance(command: CreateMediaItem): ResultOrError<MediaItem> {
        const { id, title, titleEnglish, url, contributions, mimeType } = command;

        const createDto: DTO<MediaItem> = {
            id,
            type: ResourceType.mediaItem,
            title,
            titleEnglish,
            url,
            contributorAndRoles: contributions.map((dto) => new ContributorAndRole(dto)),
            mimeType: mimeType,
            // You must execute `PUBLISH_MEDIA_ITEM` to publish
            published: false,
            // The actual length must be registered via a subsequent command
            lengthMilliseconds: 0,
        };

        return getInstanceFactoryForEntity<MediaItem>(ResourceType.mediaItem)(createDto);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const searchResults = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const preExistingMediaItems = searchResults.filter((result): result is MediaItem => {
            if (isInternalError(result)) {
                throw new InternalError(`Invalid media item in database!`, [result]);
            }

            return true;
        });

        return buildInMemorySnapshot({
            resources: {
                mediaItem: preExistingMediaItems,
            },
        });
    }

    protected validateExternalState(
        { resources: { mediaItem: preExistingMediaItems } }: InMemorySnapshot,
        instance: MediaItem
    ): InternalError | Valid {
        if (preExistingMediaItems.some(({ id }) => id === instance.id))
            return new ResourceIdAlreadyInUseError({
                id: instance.id,
                resourceType: ResourceType.mediaItem,
            });

        return Valid;
    }

    protected eventFactory(command: CreateMediaItem, eventId: AggregateId) {
        return new MediaItemCreated(command, eventId);
    }
}
