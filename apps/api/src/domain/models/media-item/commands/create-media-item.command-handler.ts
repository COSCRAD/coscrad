import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../factories/getInstanceFactoryForResource';
import { InMemorySnapshot, ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { EventRecordMetadata } from '../../shared/events/types/EventRecordMetadata';
import idEquals from '../../shared/functional/idEquals';
import { MediaItem } from '../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';
import { MediaItemCreated } from './media-item-created.event';

@CommandHandler(CreateMediaItem)
export class CreateMediaItemCommandHandler extends BaseCreateCommandHandler<MediaItem> {
    protected createNewInstance(command: CreateMediaItem): ResultOrError<MediaItem> {
        const {
            aggregateCompositeIdentifier: { id },
            title,
            titleEnglish,
            url,
            mimeType,
        } = command;

        const createDto: DTO<MediaItem> = {
            id,
            type: ResourceType.mediaItem,
            title,
            titleEnglish,
            url,
            mimeType: mimeType,
            // You must execute `PUBLISH_MEDIA_ITEM` to publish
            published: false,
            // The actual length must be registered via a subsequent command
            lengthMilliseconds: 0,
        };

        return getInstanceFactoryForResource<MediaItem>(ResourceType.mediaItem)(createDto);
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
        if (preExistingMediaItems.some(idEquals(instance.id)))
            return new ResourceIdAlreadyInUseError({
                id: instance.id,
                resourceType: ResourceType.mediaItem,
            });

        return Valid;
    }

    protected buildEvent(command: CreateMediaItem, eventMeta: EventRecordMetadata) {
        return new MediaItemCreated(command, eventMeta);
    }
}
