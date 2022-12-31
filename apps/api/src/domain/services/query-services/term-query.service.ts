import { ITermViewModel } from '@coscrad/api-interfaces';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { TermViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Term } from '../../models/term/entities/term.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class TermQueryService extends ResourceQueryService<Term, ITermViewModel> {
    protected readonly type = ResourceType.term;

    constructor(
        @Inject(RepositoryProvider) repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(term: Term) {
        const baseAudioURL = this.configService.get<string>('BASE_DIGITAL_ASSET_URL');

        return new TermViewModel(term, baseAudioURL);
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [Term];
    }
}
