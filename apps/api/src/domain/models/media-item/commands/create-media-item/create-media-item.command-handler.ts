import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../factories/get-instance-factory-for-resource';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import ResourceIdAlreadyInUseError from '../../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import idEquals from '../../../shared/functional/idEquals';
import { MediaItemDimensions } from '../../entities/media-item-dimensions';
import { MediaItem } from '../../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';
import { MediaItemCreated } from './media-item-created.event';

@CommandHandler(CreateMediaItem)
export class CreateMediaItemCommandHandler extends BaseCreateCommandHandler<MediaItem> {
    protected createNewInstance(command: CreateMediaItem): ResultOrError<MediaItem> {
        const {
            aggregateCompositeIdentifier: { id },
            title,
            url,
            mimeType,
            lengthMilliseconds,
            heightPx,
            widthPx,
        } = command;

        const createDto: DTO<MediaItem> = {
            id,
            type: ResourceType.mediaItem,
            title,
            url,
            mimeType: mimeType,
            // You must execute `PUBLISH_MEDIA_ITEM` to publish
            published: false,
            /**
             * TODO Make this required for an audio or video. Eventually we may
             * want to populate this by injecting the media prober into this
             * command handler. It is ok to cache it on the event \ model
             * because as a rule a media item's length is immutable and is a
             * core part of its identity within our system.
             */
            lengthMilliseconds,
            dimensions:
                isNullOrUndefined(heightPx) && isNullOrUndefined(widthPx)
                    ? undefined
                    : new MediaItemDimensions({
                          heightPx,
                          widthPx,
                      }),
        };

        return getInstanceFactoryForResource<MediaItem>(ResourceType.mediaItem)(createDto);
    }

    protected async fetchRequiredExternalState({
        aggregateCompositeIdentifier: { id: mediaItemId },
    }: CreateMediaItem): Promise<InMemorySnapshot> {
        const searchResult = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchById(mediaItemId);

        if (isInternalError(searchResult)) {
            throw new InternalError(`Invalid media item in database!`, [searchResult]);
        }

        const relevantExistingMediaItems = isNotFound(searchResult) ? [] : [searchResult];

        return buildInMemorySnapshot({
            resources: {
                mediaItem: relevantExistingMediaItems,
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
