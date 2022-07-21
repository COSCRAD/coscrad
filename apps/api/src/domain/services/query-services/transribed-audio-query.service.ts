import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { TranscribedAudioViewModel } from '../../../view-models/buildViewModelForResource/viewModels/transcribed-audio/transcribed-audio.view-model';
import { TranscribedAudio } from '../../models/transcribed-audio/entities/transcribed-audio.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class TranscribedAudioQueryService extends BaseQueryService<
    TranscribedAudio,
    TranscribedAudioViewModel
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
    ): TranscribedAudioViewModel {
        return new TranscribedAudioViewModel(
            transcribedAudioInstance,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(TranscribedAudio);
    }
}
