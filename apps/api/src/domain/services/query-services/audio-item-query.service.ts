import { AggregateType, IAudioItemViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { AudioItemViewModel } from '../../../view-models/buildViewModelForResource/viewModels/audio-item/audio-item.view-model';
import { AudioItem } from '../../models/audio-item/entities/audio-item.entity';
import BaseDomainModel from '../../models/BaseDomainModel';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class AudioItemQueryService extends ResourceQueryService<AudioItem, IAudioItemViewModel> {
    protected readonly type = ResourceType.audioItem;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
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
        transcribedAudioInstance: AudioItem,
        { resources: { mediaItem: mediaItems } }: InMemorySnapshot
    ): IAudioItemViewModel {
        return new AudioItemViewModel(transcribedAudioInstance, mediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [AudioItem];
    }
}
