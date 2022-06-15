import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { TermViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { Tag } from '../../models/tag/tag.entity';
import { Term } from '../../models/term/entities/term.entity';
import { ISpecification } from '../../repositories/interfaces/ISpecification';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class TermQueryService extends BaseQueryService<Term, TermViewModel> {
    constructor(
        private readonly repositoryProvider: RepositoryProvider,
        commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(ResourceType.term, commandInfoService);
    }

    buildViewModel(term: Term) {
        const baseAudioURL = this.configService.get<string>('BASE_DIGITAL_ASSET_URL');

        return new TermViewModel(term, baseAudioURL);
    }

    async fetchDomainModelById(id: string): Promise<ResultOrError<Maybe<Term>>> {
        return this.repositoryProvider.forResource<Term>(ResourceType.term).fetchById(id);
    }

    async fetchManyDomainModels(
        specification: ISpecification<Term, string | boolean>
    ): Promise<ResultOrError<Term>[]> {
        return this.repositoryProvider
            .forResource<Term>(ResourceType.term)
            .fetchMany(specification);
    }

    async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const tags = (await this.repositoryProvider.getTagRepository().fetchMany()).filter(
            (result): result is Tag => !isInternalError(result)
        );

        return buildInMemorySnapshot({
            tags,
        });
    }
}
