import { EntityType, entityTypes } from '../../domain/types/entityType';
import { InternalError } from '../../lib/errors/InternalError';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import buildTagViewModels from './viewModelBuilders/buildTagViewModels';
import buildTermViewModels from './viewModelBuilders/buildTermViewModels';
import buildVocabularyListViewModels from './viewModelBuilders/buildVocabularyListViewModels';

export type ViewModelBuilderDependencies = {
  repositoryProvider: RepositoryProvider;
};

export default (
  entityType: EntityType,
  dependencies: ViewModelBuilderDependencies
) => {
  switch (entityType) {
    case entityTypes.term:
      return buildTermViewModels(dependencies);

    case entityTypes.vocabularyList:
      return buildVocabularyListViewModels(dependencies);

    case entityTypes.tag:
      return buildTagViewModels(dependencies);

    default:
      const exhaustiveCheck: never = entityType;

      return new InternalError(
        `Cannot build view model for unsupported entity type: ${exhaustiveCheck}`
      );
  }
};
