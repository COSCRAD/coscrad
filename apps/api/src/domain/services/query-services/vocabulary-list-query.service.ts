import { Inject, Injectable } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { VocabularyListViewModel } from '../../../queries/buildViewModelForResource/viewModels';
import BaseDomainModel from '../../models/BaseDomainModel';
import { Tag } from '../../models/tag/tag.entity';
import { Term } from '../../models/term/entities/term.entity';
import { VocabularyList } from '../../models/vocabulary-list/entities/vocabulary-list.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import IsPublished from '../../repositories/specifications/isPublished';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { InMemorySnapshot, ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

@Injectable()
export class VocabularyListQueryService extends ResourceQueryService<
    VocabularyList,
    VocabularyListViewModel
> {
    protected readonly type = ResourceType.vocabularyList;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN) repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) commandInfoService: CommandInfoService
    ) {
        super(repositoryProvider, commandInfoService);
    }

    buildViewModel(
        vocabularyList: VocabularyList,
        { resources: { term: allTerms } }: InMemorySnapshot
    ): VocabularyListViewModel {
        return new VocabularyListViewModel(vocabularyList, allTerms);
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

        return new DeluxeInMemoryStore({
            tag: allTags,
            resources: {
                term: allTerms,
            },
        }).fetchFullSnapshotInLegacyFormat();
    }

    getDomainModelCtors(): DomainModelCtor<BaseDomainModel>[] {
        return [VocabularyList];
    }
}
