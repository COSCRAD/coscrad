import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER } from '../../../persistence/constants/persistenceConstants';
import { PhotographViewModel } from '../../../view-models/buildViewModelForResource/viewModels/photograph.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PhotographQueryService extends ResourceQueryService<Photograph, IPhotographViewModel> {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(REPOSITORY_PROVIDER) repositoryProvider: IRepositoryProvider,
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

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Photograph];
    }
}
