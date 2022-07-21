import { Term } from '../../../domain/models/term/entities/term.entity';
import IsPublished from '../../../domain/repositories/specifications/isPublished';
import { ResourceType } from '../../../domain/types/ResourceType';
import { isInternalError } from '../../../lib/errors/InternalError';
import { TermViewModel } from '../viewModels';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider, configService }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<TermViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const termRepository = repositoryProvider.forResource<Term>(ResourceType.term);

    const searchResult = await termRepository.fetchMany(isPublishedSpecification);

    const allTermViewModels = searchResult
        // We are swallowing the error. It would be good to at least log the invalid state.
        .filter((result): result is Term => !isInternalError(result))
        .map(
            (term) => new TermViewModel(term, configService.get<string>('BASE_DIGITAL_ASSET_URL'))
        );

    return allTermViewModels;
};
