import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import { Valid } from '../../../../domainModelValidators/Valid';
import { ID_MANAGER_TOKEN, IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../../../types/ResourceType';
import { Video, VideoItemBase } from '../../../audio-item/entities/video.entity';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { CreateVideo } from './create-video.command';
import { VideoCreated } from './video-created.event';

@CommandHandler(CreateVideo)
export class CreateVideoCommandHandler extends BaseCreateCommandHandler<Video> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<Video>;

    protected aggregateType: AggregateType = AggregateType.video;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(ID_MANAGER_TOKEN) protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.forResource<Video>(
            ResourceType.video
        );
    }

    protected createNewInstance({
        name,
        aggregateCompositeIdentifier: { id },
        mediaItemId,
        lengthMilliseconds,
    }: CreateVideo): ResultOrError<Video> {
        // Due to the mixin, we do not have typesafety in the constructor call bellow, so we type the DTO here
        const videoItemDto: DTO<VideoItemBase> = {
            name,
            id,
            type: AggregateType.video,
            mediaItemId,
            lengthMilliseconds,
            published: false,
        };

        // the cast is necessary due to loss of type-safety from using a mixin
        return new Video(videoItemDto) as unknown as Video;
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

    protected buildEvent(command: CreateVideo, eventId: string, userId: string): BaseEvent {
        return new VideoCreated(command, eventId, userId);
    }
}
