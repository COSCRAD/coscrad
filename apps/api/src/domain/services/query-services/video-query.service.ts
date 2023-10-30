import { AggregateType, IVideoViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { VideoViewModel } from '../../../queries/buildViewModelForResource/viewModels/audio-visual/video.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Video } from '../../models/audio-item/entities/video.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class VideoQueryService extends ResourceQueryService<Video, IVideoViewModel> {
    protected readonly type = ResourceType.video;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const mediaItemSearchResult = await this.repositoryProvider
            .forResource<MediaItem>(AggregateType.mediaItem)
            .fetchMany();

        const allMediaItems = mediaItemSearchResult.filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: allMediaItems,
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        videoInstance: Video,
        { resources: { mediaItem: mediaItems } }: InMemorySnapshot
    ): IVideoViewModel {
        return new VideoViewModel(videoInstance, mediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Video as unknown as DomainModelCtor<Video>];
    }
}
