import { AggregateType, ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER } from '../../../persistence/constants/persistenceConstants';
import { TranscribedAudioViewModel } from '../../../view-models/buildViewModelForResource/viewModels/transcribed-audio/transcribed-audio.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { MediaItem } from '../../models/media-item/entities/media-item.entity';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { Transcript } from '../../models/transcribed-audio/entities/transcribed-audio.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class TranscribedAudioQueryService extends ResourceQueryService<
    Transcript,
    ITranscribedAudioViewModel
> {
    protected readonly type = ResourceType.transcribedAudio;

    constructor(
        @Inject(REPOSITORY_PROVIDER) repositoryProvider: IRepositoryProvider,
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
        transcribedAudioInstance: Transcript,
        { resources: { mediaItem: mediaItems } }: InMemorySnapshot
    ): ITranscribedAudioViewModel {
        return new TranscribedAudioViewModel(transcribedAudioInstance, mediaItems);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Transcript];
    }
}
