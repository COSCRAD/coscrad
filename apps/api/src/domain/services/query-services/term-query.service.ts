import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { TermViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { Tag } from '../../models/tag/tag.entity';
import { Term } from '../../models/term/entities/term.entity';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class TermQueryService extends BaseQueryService<Term, TermViewModel> {
    constructor(
        repositoryProvider: RepositoryProvider,
        commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(ResourceType.term, repositoryProvider, commandInfoService);
    }

    buildViewModel(term: Term) {
        const baseAudioURL = this.configService.get<string>('BASE_DIGITAL_ASSET_URL');

        return new TermViewModel(term, baseAudioURL);
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
