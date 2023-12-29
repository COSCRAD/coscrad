import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import {
    MultilingualText,
    MultilingualTextItem,
    MultilingualTextItemRole,
} from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import getInstanceFactoryForResource from '../../../../factories/get-instance-factory-for-resource';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { Video, VideoBase } from '../../../audio-item/entities/video.entity';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { CreateVideo } from './create-video.command';
import { VideoCreated } from './video-created.event';

@CommandHandler(CreateVideo)
export class CreateVideoCommandHandler extends BaseCreateCommandHandler<Video> {
    protected createNewInstance({
        name,
        languageCodeForName,
        aggregateCompositeIdentifier: { id },
        mediaItemId,
        lengthMilliseconds,
    }: CreateVideo): ResultOrError<Video> {
        // Due to the mixin, we do not have typesafety in the constructor call bellow, so we type the DTO here
        const videoItemDto: DTO<VideoBase> = {
            name: new MultilingualText({
                items: [
                    new MultilingualTextItem({
                        text: name,
                        languageCode: languageCodeForName,
                        role: MultilingualTextItemRole.original,
                    }),
                ],
            }),
            id,
            type: AggregateType.video,
            mediaItemId,
            lengthMilliseconds,
            published: false,
        };

        // the cast is necessary due to loss of type-safety from using a mixin
        return getInstanceFactoryForResource<Video>(ResourceType.video)(videoItemDto);
    }

    protected async fetchRequiredExternalState({
        mediaItemId,
    }: CreateVideo): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource(AggregateType.mediaItem)
            .fetchById(mediaItemId);

        if (isInternalError(mediaItemSearchResult)) {
            throw new InternalError(
                `Failed to fetch existing state as ${formatAggregateCompositeIdentifier({
                    type: AggregateType.mediaItem,
                    id: mediaItemId,
                })} has invalid state.`,
                [mediaItemSearchResult]
            );
        }

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: isNotFound(mediaItemSearchResult)
                ? []
                : [mediaItemSearchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        snapshot: InMemorySnapshot,
        instance: Video
    ): InternalError | Valid {
        return instance.validateExternalReferences(snapshot);
    }

    protected buildEvent(command: CreateVideo, eventMeta: EventRecordMetadata): BaseEvent {
        return new VideoCreated(command, eventMeta);
    }
}
