import { ConfigService } from '@nestjs/config';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { PhotographViewModel } from '../../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class PhotographQueryService extends BaseQueryService<Photograph, PhotographViewModel> {
    constructor(
        repositoryProvider: RepositoryProvider,
        commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(ResourceType.photograph, repositoryProvider, commandInfoService);
    }

    buildViewModel(photo: Photograph): PhotographViewModel {
        return new PhotographViewModel(
            photo,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(Photograph);
    }
}
