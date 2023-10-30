import { AggregateType, IPlayListViewModel, ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { PlaylistViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { AudioItem } from '../../models/audio-item/entities/audio-item.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { Playlist } from '../../models/playlist';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PlaylistQueryService extends ResourceQueryService<Playlist, IPlayListViewModel> {
    protected readonly type = ResourceType.playlist;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected override async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const allAudioItems = await this.repositoryProvider
            .forResource<AudioItem>(ResourceType.audioItem)
            .fetchMany();

        const allMediaItems = await this.repositoryProvider
            .forResource<MediaItem>(ResourceType.mediaItem)
            .fetchMany();

        const allTags = await this.repositoryProvider.getTagRepository().fetchMany();

        return new DeluxeInMemoryStore({
            [ResourceType.audioItem]: allAudioItems.filter(validAggregateOrThrow),
            [ResourceType.mediaItem]: allMediaItems.filter(validAggregateOrThrow),
            [AggregateType.tag]: allTags.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(
        playlist: Playlist,
        { resources: { audioItem: allAudioItems, mediaItem: allMediaItems } }: InMemorySnapshot
    ): IPlayListViewModel {
        return new PlaylistViewModel(playlist, allAudioItems, allMediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Playlist];
    }
}
