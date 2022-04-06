import { Book } from 'apps/api/src/domain/models/book/entities/book.entity';
import IsPublished from 'apps/api/src/domain/repositories/specifications/isPublished';
import { entityTypes } from 'apps/api/src/domain/types/entityTypes';
import { isInternalError } from 'apps/api/src/lib/errors/InternalError';
import { BookViewModel } from '../viewModels/book.view-model';
import { ViewModelBuilderDependencies } from './types/ViewModelBuilderDependencies';
import {
    getDefaultViewModelBuilderOptions,
    ViewModelBuilderOptions,
} from './types/ViewModelBuilderOptions';

const defaultOptions = getDefaultViewModelBuilderOptions();

export default async (
    { repositoryProvider }: ViewModelBuilderDependencies,
    optionOverrides: Partial<ViewModelBuilderOptions> = defaultOptions
): Promise<BookViewModel[]> => {
    const { shouldReturnUnpublishedEntities } = {
        ...defaultOptions,
        ...optionOverrides,
    };

    const isPublishedSpecification = shouldReturnUnpublishedEntities ? null : new IsPublished(true);

    const bookRepository = repositoryProvider.forEntity<Book>(entityTypes.book);

    const searchResult = await bookRepository.fetchMany(isPublishedSpecification);

    const allBookViewModels = searchResult
        .filter((result): result is Book => !isInternalError(result))
        .map((book) => new BookViewModel(book));

    return allBookViewModels;
};
