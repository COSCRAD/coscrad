import { AggregateType, IAudioItemViewModel, IMediaAnnotation } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { StateBasedAudioItemViewModel } from '../../../queries/buildViewModelForResource/viewModels/audio-visual/audio-item.view-model.state-based';
import { AudioItem } from '../../models/audio-visual/audio-item/entities/audio-item.entity';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { buildAnnotationsFromSnapshot } from './build-annotations-from-snapshot';
import { ResourceQueryService } from './resource-query.service';

export type AudioLineageRecord = {
    filename: string;
    audioItemId: AggregateId;
};

export class AudioItemQueryService extends ResourceQueryService<
    AudioItem,
    Omit<IAudioItemViewModel, 'actions'>
> {
    protected readonly type = ResourceType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [
            audioItemSearchResult,
            mediaItemSearchResult,
            noteSearchResult,
            contributorSearchResult,
            tagSearchResult,
        ] = await Promise.all([
            this.repositoryProvider.forResource<AudioItem>(AggregateType.audioItem).fetchMany(),
            this.repositoryProvider.forResource<MediaItem>(AggregateType.mediaItem).fetchMany(),
            // Can we at least put the `fetch notes for` here?
            this.repositoryProvider.getEdgeConnectionRepository().fetchMany(),
            this.repositoryProvider.getContributorRepository().fetchMany(),
            this.repositoryProvider.getTagRepository().fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [AggregateType.audioItem]: audioItemSearchResult.filter(validAggregateOrThrow),
            [AggregateType.mediaItem]: mediaItemSearchResult.filter(validAggregateOrThrow),
            [AggregateType.note]: noteSearchResult.filter(validAggregateOrThrow),
            [AggregateType.contributor]: contributorSearchResult.filter(validAggregateOrThrow),
            [AggregateType.tag]: tagSearchResult.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        transcribedAudioInstance: AudioItem,
        { resources: { mediaItem: mediaItems }, contributor: allContributors }: InMemorySnapshot
    ): // note that actions (available commands) are added at a higher level
    Omit<IAudioItemViewModel, 'actions'> {
        return new StateBasedAudioItemViewModel(
            transcribedAudioInstance,
            mediaItems,
            allContributors
        );
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [AudioItem as unknown as DomainModelCtor<AudioItem>];
    }

    async getAnnotations(): Promise<IMediaAnnotation[]> {
        const flastSnapshot = await this.fetchRequiredExternalState();

        const inMemoryStore = new DeluxeInMemoryStore(flastSnapshot);

        return buildAnnotationsFromSnapshot(inMemoryStore);
    }

    async getMediaLineage(): Promise<AudioLineageRecord[]> {
        const audioItems = await this.repositoryProvider
            .forResource<AudioItem>(ResourceType.audioItem)
            .fetchMany();

        const mediaItems = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const mediaFilenameById = mediaItems
            .filter(validAggregateOrThrow)
            .reduce(
                (table, mediaItem) =>
                    table.set(mediaItem.id, mediaItem.getName().getOriginalTextItem().text),
                new Map()
            );

        const mediaFilenameByAudioItemId = audioItems
            .filter(validAggregateOrThrow)
            .reduce((table, audioItem) => {
                const { id, mediaItemId } = audioItem;

                const filename = mediaFilenameById.get(mediaItemId);

                return table.set(id, filename);
            }, new Map());

        return Array.from(mediaFilenameByAudioItemId.entries()).map(([audioItemId, filename]) => ({
            audioItemId,
            filename,
        }));
    }
}
