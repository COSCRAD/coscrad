import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { VocabularyList } from 'apps/api/src/domain/models/vocabulary-list/entities/vocabulary-list.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityType';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ViewModelBuilderDependencies } from '../buildViewModelForEntity';
import { VocabularyListViewModel } from '../viewModels';

// Should we make this a class?
export default async ({
  repositoryProvider,
}: ViewModelBuilderDependencies): Promise<VocabularyListViewModel[]> => {
  const vocabularyListRepository = repositoryProvider.forEntity<VocabularyList>(
    entityTypes.vocabularyList
  );

  // We need to join the terms by id
  const termRepository = repositoryProvider.forEntity<Term>(entityTypes.term);

  const allTerms = await termRepository.fetchMany().then((allTerms) =>
    // We filter out invalid DTOs in case they occur
    allTerms
      .filter((term): term is Term => !isInternalError(term))
      // TODO Make this happen in one place (not in every view model builder)
      .filter(({ published }) => published)
  );

  const allVocabularyListViewModels = await vocabularyListRepository
    .fetchMany()
    .then((vocabularyLists) =>
      vocabularyLists
        .filter((list): list is VocabularyList => !isInternalError(list))
        // TODO Make this happen in one place (not in every view model builder)
        .filter(({ published }) => published)
        .map((list) => new VocabularyListViewModel(list, allTerms))
    );

  return allVocabularyListViewModels;
};
