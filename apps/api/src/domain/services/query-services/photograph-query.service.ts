import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { PhotographViewModel } from '../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Photograph } from '../../models/photograph/entities/photograph.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class PhotographQueryService extends ResourceQueryService<Photograph, IPhotographViewModel> {
    protected readonly type = ResourceType.photograph;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(photo: Photograph): IPhotographViewModel {
        return new PhotographViewModel(photo);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Photograph];
    }
}
