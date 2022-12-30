import { ICommandFormAndLabels, IPhotographViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { PhotographViewModel } from '../../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PhotographQueryService extends ResourceQueryService<Photograph, IPhotographViewModel> {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(RepositoryProvider) repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(photo: Photograph): IPhotographViewModel {
        return new PhotographViewModel(
            photo,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );
    }

    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return this.commandInfoService.getCommandInfo(Photograph);
    }
}
