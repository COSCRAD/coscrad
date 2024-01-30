import { AggregateType, IAudioItemViewModel, IMediaAnnotation } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { AudioItemViewModel } from '../../../queries/buildViewModelForResource/viewModels/audio-visual/audio-item.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { AudioItem } from '../../models/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { buildAnnotationsFromSnapshot } from './build-annotations-from-snapshot';
import { ResourceQueryService } from './resource-query.service';

export class AudioItemQueryService extends ResourceQueryService<AudioItem, IAudioItemViewModel> {
    protected readonly type = ResourceType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [audioItemSearchResult, mediaItemSearchResult, noteSearchResult] = await Promise.all([
            this.repositoryProvider.forResource<AudioItem>(AggregateType.audioItem).fetchMany(),
            this.repositoryProvider.forResource<MediaItem>(AggregateType.mediaItem).fetchMany(),
            // Can we at least put the `fetch notes for` here?
            this.repositoryProvider.getEdgeConnectionRepository().fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: audioItemSearchResult.filter(validAggregateOrThrow),
            [AggregateType.mediaItem]: mediaItemSearchResult.filter(validAggregateOrThrow),
            [AggregateType.note]: noteSearchResult.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        transcribedAudioInstance: AudioItem,
        { resources: { mediaItem: mediaItems }, [AggregateType.note]: allNotes }: InMemorySnapshot
    ): IAudioItemViewModel {
        return new AudioItemViewModel(transcribedAudioInstance, mediaItems, allNotes);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [AudioItem as unknown as DomainModelCtor<AudioItem>];
    }

    async getAnnotations(): Promise<IMediaAnnotation[]> {
        const flastSnapshot = await this.fetchRequiredExternalState();

        const inMemoryStore = new DeluxeInMemoryStore(flastSnapshot);

        return buildAnnotationsFromSnapshot(inMemoryStore);
    }
}
