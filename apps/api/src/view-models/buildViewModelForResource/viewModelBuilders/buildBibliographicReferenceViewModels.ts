import { IBibliographicReference } from '../../../domain/models/bibliographic-reference/interfaces/IBibliographicReference';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { BibliographicReferenceViewModel } from '../viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider }: ViewModelBuilderDependencies,
    optionOverrides?: Partial<ViewModelBuilderOptions>
): Promise<BibliographicReferenceViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const searchResult = await repositoryProvider
        .forResource<IBibliographicReference>(ResourceType.bibliographicReference)
        .fetchMany(isPublishedSpecification);

    const allViewModels = searchResult
        .filter((result): result is IBibliographicReference => !isInternalError(result))
        .map(
            (bibliographicReference) => new BibliographicReferenceViewModel(bibliographicReference)
        );

    return allViewModels;
};
