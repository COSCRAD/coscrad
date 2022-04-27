import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { resourceTypes } from '../../../domain/types/resourceTypes';
import { isInternalError } from '../../../lib/errors/InternalError';
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

    const vocabularyListRepository = repositoryProvider.forResource<VocabularyList>(
        resourceTypes.vocabularyList
    );

    // We need to join the terms by id
    const termRepository = repositoryProvider.forResource<Term>(resourceTypes.term);

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
