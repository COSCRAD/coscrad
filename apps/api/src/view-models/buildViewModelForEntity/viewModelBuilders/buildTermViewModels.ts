import { Term } from 'apps/api/src/domain/models/term/entities/term.entity';
import IsPublished from 'apps/api/src/domain/repositories/specifications/isPublished';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
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

    const termRepository = repositoryProvider.forEntity<Term>(entityTypes.term);

    const searchResult = await termRepository.fetchMany(isPublishedSpecification);

    const allTermViewModels = searchResult
        // We are swallowing the error. It would be good to at least log the invalid state.
        .filter((result): result is Term => !isInternalError(result))
        .map((term) => new TermViewModel(term, configService.get<string>('BASE_AUDIO_URL')));

    return allTermViewModels;
};
