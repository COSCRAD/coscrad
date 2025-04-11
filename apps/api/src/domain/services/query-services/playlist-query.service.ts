import { AggregateType, IPlayListViewModel, ResourceType } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { AudioItem } from '../../models/audio-visual/audio-item/entities/audio-item.entity';
import BaseDomainModel from '../../models/base-domain-model.entity';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { Playlist } from '../../models/playlist';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PlaylistQueryService extends ResourceQueryService<
    Playlist,
    Omit<IPlayListViewModel, 'actions'>
> {
    protected readonly type = ResourceType.playlist;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly _configService: ConfigService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    protected override async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [allAudioItems, allMediaItems, allTags, allContributors] = await Promise.all([
            this.repositoryProvider.forResource<AudioItem>(ResourceType.audioItem).fetchMany(),
            this.repositoryProvider.forResource<MediaItem>(ResourceType.mediaItem).fetchMany(),
            this.repositoryProvider.getTagRepository().fetchMany(),
            this.repositoryProvider.getContributorRepository().fetchMany(),
        ]);

        return new DeluxeInMemoryStore({
            [ResourceType.audioItem]: allAudioItems.filter(validAggregateOrThrow),
            [ResourceType.mediaItem]: allMediaItems.filter(validAggregateOrThrow),
            [AggregateType.tag]: allTags.filter(validAggregateOrThrow),
            [AggregateType.contributor]: allContributors.filter(validAggregateOrThrow),
        }).fetchFullSnapshotInLegacyFormat();
    }

    buildViewModel(_playlist: Playlist, __: InMemorySnapshot): Omit<IPlayListViewModel, 'actions'> {
        throw new Error(`deprecated`);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Playlist];
    }
}
