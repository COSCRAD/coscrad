import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { VocabularyListViewModel } from '../../../view-models/buildViewModelForResource/viewModels';
import { Tag } from '../../models/tag/tag.entity';
import { Term } from '../../models/term/entities/term.entity';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import IsPublished from '../../repositories/specifications/isPublished';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { BaseQueryService } from './base-query.service';

@Injectable()
export class VocabularyListQueryService extends BaseQueryService<
    VocabularyList,
    VocabularyListViewModel
> {
    protected readonly type = ResourceType.vocabularyList;

    constructor(
        @Inject(RepositoryProvider) repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService,
        private readonly configService: ConfigService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(
        vocabularyList: VocabularyList,
        { resources: { term: allTerms } }: InMemorySnapshot
    ): VocabularyListViewModel {
        return new VocabularyListViewModel(
            vocabularyList,
            allTerms,
            this.configService.get<string>('BASE_DIGITAL_ASSET_URL')
        );
    }

    override async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [allTags, allTerms] = await Promise.all([
            this.repositoryProvider
                .getTagRepository()
                .fetchMany()
                .then((results) =>
                    results.filter((result): result is Tag => !isInternalError(result))
                ),
            this.repositoryProvider
                .forResource<Term>(ResourceType.term)
                .fetchMany(new IsPublished(true))
                .then((results) =>
                    results.filter((result): result is Term => !isInternalError(result))
                ),
        ]);

        return buildInMemorySnapshot({
            tag: allTags,
            resources: {
                term: allTerms,
            },
        });
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return this.commandInfoService.getCommandInfo(VocabularyList);
    }
}
