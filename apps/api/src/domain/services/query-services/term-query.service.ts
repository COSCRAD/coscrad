import { ITermViewModel } from '@coscrad/api-interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { TermViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Term } from '../../models/term/entities/term.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class TermQueryService extends ResourceQueryService<Term, ITermViewModel> {
    protected readonly type = ResourceType.term;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(term: Term) {
        return new TermViewModel(term);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Term];
    }
}
