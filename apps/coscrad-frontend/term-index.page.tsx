import { ITermViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyString } from '@coscrad/validation-constraints';
import { Box, Stack } from '@mui/material';
import { useContext, useState } from 'react';
import { useAppDispatch } from './src/app/hooks';

import { TermPaginator } from './src/components/resources/terms/term-paginator';
import { TermSearchBar } from './src/components/resources/terms/term-search-bar';
import { ConfigurableContentContext } from './src/configurable-front-matter/configurable-content-provider';
import {
    ALL_PROPERTIES_SEARCH_KEY,
    fetchTerms,
    filterTerms,
    IndexSearchScope,
    IUserDefinedFilter,
    IUserQueryOptions,
} from './src/store/slices/resources';
import { TermListContainer } from './term-list.container';

const compileMultilingualTextContainsQuery = (
    fieldName: keyof ITermViewModel,
    queryString: string
): IUserDefinedFilter<ITermViewModel> => {
    const extractedLanguageCode = queryString.slice(1).split('}')[0];

    const searchTermsWithLanguageCodeRemoved = queryString.split('}')[1];

    if (Object.values(LanguageCode).some((lc) => lc === extractedLanguageCode)) {
        return {
            type: 'SIMPLE',
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            field: fieldName,
            params: [searchTermsWithLanguageCodeRemoved, extractedLanguageCode],
        };
    }

    /**
     * If the language code is not a known language code, we naively search
     * for the text, e.g., including `{foo}` in `{foo}Ooops`.
     */
    return {
        type: 'SIMPLE',
        field: fieldName,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [queryString],
    };
};

const interpretCoscradQueryFromUserSearchText = (
    scope: IndexSearchScope<ITermViewModel>,
    queryString: string,
    defaultLanguageCode: LanguageCode = LanguageCode.English
): IUserQueryOptions<ITermViewModel>['filter'] => {
    if (scope === ALL_PROPERTIES_SEARCH_KEY) {
        return {
            type: 'OR',
            // @ts-expect-error TODO let's sort out the full types in api-interfaces
            conditions: (['name', 'contributions', 'vocabularyLists', 'tokens'] as const).map(
                (field) =>
                    interpretCoscradQueryFromUserSearchText(field, queryString, defaultLanguageCode)
            ),
        };
    }

    if (scope === 'name') {
        if (queryString.charAt(0) === '{' && queryString.includes('}')) {
            return compileMultilingualTextContainsQuery(scope, queryString);
        }
    }

    if (scope === 'contributions') {
        const simpleFilter: IUserQueryOptions<ITermViewModel>['filter'] = {
            type: 'SIMPLE',
            field: `contributions[*].statement`,
            operator: 'TEXT_INCLUDES',
            params: [queryString],
        };

        return simpleFilter;
    }

    if (scope === 'vocabularyLists') {
        return {
            type: 'SIMPLE',
            field: `vocabularyLists[*].name`,
            operator: 'MULTILINGUAL_TEXT_INCLUDES',
            // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-340] Include language code option
            params: [queryString],
        };
    }

    if (scope === 'tokens') {
        return {
            type: 'SIMPLE',
            field: `tokens`,
            // TODO support this
            operator: 'MULTILINGUAL_TEXT_INCLUDES_LETTER',
            /**
             * Allow the user to specify the language code once we tokenize English as well.
             * Right now, we assume that users will only search the Indigenous language
             * that is default for the tenant.
             */
            params: [queryString, defaultLanguageCode],
        };
    }

    const simpleFilter: IUserQueryOptions<ITermViewModel>['filter'] = {
        type: 'SIMPLE',
        field: scope,
        operator: 'MULTILINGUAL_TEXT_INCLUDES',
        params: [queryString],
    };

    return simpleFilter;
};

export const TermIndexPage = (): JSX.Element => {
    const dispatch = useAppDispatch();

    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const [filter, setFilter] = useState<IUserDefinedFilter<ITermViewModel> | null>(null);

    const [paginationOptions, setPaginationOptions] = useState<{ size: number; page: number }>({
        size: 100,
        page: 1,
    });

    const searchInDb = (scope: IndexSearchScope<ITermViewModel>, queryFromForm: string) => {
        if (!isNonEmptyString(queryFromForm)) {
            return dispatch(fetchTerms(null));
        }

        /**
         * TODO We haven't settled on how we will handle this in the long run.
         * We have started by compiling a query string on the client because
         * that is consistent with the current UX. However, we are considering
         * updating the UX and leveraging a more sophisticated search form whose
         * state would be object-valued already.
         *
         * If we stick with compiling string queries, we may want to send the
         * string to the back-end for compilation. Note that at some point we
         * may want to use the same query language for in-memory filtering,
         * in which case we could move that logic to a lib.
         */

        const filter = interpretCoscradQueryFromUserSearchText(
            scope,
            queryFromForm,
            defaultLanguageCode
        );

        setFilter(filter);

        dispatch(
            fetchTerms({
                filter: filter,
                pagination: paginationOptions,
            })
        );
    };

    const _searchInMemory = (scope: IndexSearchScope<ITermViewModel>, queryFromForm: string) => {
        // TODO type safety
        const action = filterTerms({ scope, query: queryFromForm });

        dispatch(action);
    };

    return (
        <div>
            <Stack>
                {/* <Typography variant="h2">{label}</Typography> */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <TermSearchBar
                        onValueChange={(searchScope, newValue: string) => {
                            searchInDb(searchScope, newValue);
                        }}
                        scopes={['name', 'contributions', 'vocabularyLists', 'tokens']}
                    />
                </Box>
                <Box>
                    <TermListContainer />
                </Box>
                <Box>
                    <TermPaginator
                        count={0}
                        pageCount={10}
                        onPageSizeChange={function (pageSize: number): void {
                            const newPaginationOptions = {
                                ...paginationOptions,
                                size: pageSize,
                            };

                            setPaginationOptions(newPaginationOptions);

                            console.log({
                                dispatch: {
                                    filter,
                                    paginationOptions,
                                    pageSize,
                                    newPaginationOptions,
                                },
                            });

                            dispatch(
                                fetchTerms({
                                    filter,
                                    pagination: newPaginationOptions,
                                })
                            );
                        }}
                        onPageNumberChange={function (pageNumber: number): void {
                            const newPaginationOptions = {
                                ...paginationOptions,
                                page: pageNumber,
                            };

                            setPaginationOptions(newPaginationOptions);

                            dispatch(
                                fetchTerms({
                                    filter,
                                    pagination: newPaginationOptions,
                                })
                            );
                        }}
                        page={paginationOptions.page}
                        pageSize={paginationOptions.size}
                    />
                </Box>
            </Stack>
        </div>
    );
};
