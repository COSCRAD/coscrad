import { LanguageCode, PaginatedResponse } from '@coscrad/api-interfaces';
import { ResultOrError } from '../../../types/ResultOrError';
import { Token } from '../tokenization';
import { FullTextSearchRecord } from './full-text-result-record.dto';

export const FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN =
    'FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN';

export interface IFullTextSearchQueryRepository {
    index(tokens: Token[], entityCompositeIdentifier: { type: string; id: string }): Promise<void>;

    findByLetter(
        letter: string,
        languageCode?: LanguageCode
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>>;

    findByText(
        searchText: string,
        languageCode?: LanguageCode
    ): Promise<ResultOrError<PaginatedResponse<FullTextSearchRecord>>>;

    // semanticSearch
}
