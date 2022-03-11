import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import { entityTypes } from 'apps/api/src/domain/types/entityType';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { ViewModelBuilderDependencies } from '../buildViewModelForEntity';
import { TermViewModel } from '../viewModels';

export default async ({
  repositoryProvider,
}: ViewModelBuilderDependencies): Promise<TermViewModel[]> => {
  const termRepository = repositoryProvider.forEntity<Term>(entityTypes.term);

  const searchResult = await termRepository.fetchMany();

  // We are swallowing the error. It would be good to at least log the invalid state.
  const allTermViewModels = searchResult
    .filter((result): result is Term => !isInternalError(result))
    .map((term) => new TermViewModel(term));

  return allTermViewModels;
};
