import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { VocabularyList } from 'apps/api/src/domain/models/vocabulary-list/entities/vocabulary-list.entity';
import IsPublished from 'apps/api/src/domain/repositories/specifications/isPublished';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { VocabularyListViewModel } from '../viewModels';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

// Should we make this a class?
export default async (
    { repositoryProvider, configService }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<VocabularyListViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const vocabularyListRepository = repositoryProvider.forEntity<VocabularyList>(
        entityTypes.vocabularyList
    );

    // We need to join the terms by id
    const termRepository = repositoryProvider.forEntity<Term>(entityTypes.term);

    const allTerms = await termRepository.fetchMany(isPublishedSpecification).then((allTerms) =>
        // We filter out invalid DTOs in case they occur
        allTerms.filter((term): term is Term => !isInternalError(term))
    );

    const allVocabularyListViewModels = await vocabularyListRepository
        .fetchMany(isPublishedSpecification)
        .then((vocabularyLists) =>
            vocabularyLists
                .filter((list): list is VocabularyList => !isInternalError(list))
                // TODO Make this happen in one place (not in every view model builder)
                .filter(({ published }) => published)
                .map(
                    (list) =>
                        new VocabularyListViewModel(
                            list,
                            allTerms,
                            configService.get<string>('BASE_DIGITAL_ASSET_URL')
                        )
                )
        );

    return allVocabularyListViewModels;
};
