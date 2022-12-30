import { ITranscribedAudioViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { TranscribedAudioViewModel } from '../../../view-models/buildViewModelForResource/viewModels/transcribed-audio/transcribed-audio.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { TranscribedAudio } from '../../models/transcribed-audio/entities/transcribed-audio.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class TranscribedAudioQueryService extends ResourceQueryService<
    TranscribedAudio,
    ITranscribedAudioViewModel
> {
    protected readonly type = ResourceType.transcribedAudio;

    constructor(
        @Inject(RepositoryProvider) repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(
        transcribedAudioInstance: TranscribedAudio,
        _: InMemorySnapshot
    ): ITranscribedAudioViewModel {
        return new TranscribedAudioViewModel(
            transcribedAudioInstance,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [TranscribedAudio];
    }
}
