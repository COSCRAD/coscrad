import { AggregateType, IMediaAnnotation, IVideoViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { VideoViewModel } from '../../../queries/buildViewModelForResource/viewModels/audio-visual/video.view-model';
import { Video } from '../../models/audio-visual/video/entities/video.entity';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { buildAnnotationsFromSnapshot } from './build-annotations-from-snapshot';
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
        const [
            mediaItemSearchResult,
            videoSearchResult,
            noteSearchResult,
            contributorSearchResult,
        ] = await Promise.all([
            this.repositoryProvider.forResource<MediaItem>(AggregateType.mediaItem).fetchMany(),
            this.repositoryProvider.forResource<Video>(AggregateType.video).fetchMany(),
            this.repositoryProvider.getEdgeConnectionRepository().fetchMany(),
            this.repositoryProvider.getContributorRepository().fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.mediaItem]: mediaItemSearchResult.filter(validAggregateOrThrow),
            [AggregateType.video]: videoSearchResult.filter(validAggregateOrThrow),
            [AggregateType.note]: noteSearchResult.filter(validAggregateOrThrow),
            [AggregateType.contributor]: contributorSearchResult.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        videoInstance: Video,
        { resources: { mediaItem: mediaItems }, contributor: contributors }: InMemorySnapshot
    ): IVideoViewModel {
        return new VideoViewModel(videoInstance, mediaItems, contributors);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Video as unknown as DomainModelCtor<Video>];
    }

    async getAnnotations(): Promise<IMediaAnnotation[]> {
        const flastSnapshot = await this.fetchRequiredExternalState();

        const inMemoryStore = new DeluxeInMemoryStore(flastSnapshot);

        return buildAnnotationsFromSnapshot(inMemoryStore);
    }
}
