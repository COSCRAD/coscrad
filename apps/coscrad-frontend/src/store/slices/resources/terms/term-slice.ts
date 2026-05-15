import {
    HttpStatusCode,
    IDetailQueryResult,
    IHttpErrorInfo,
    IIndexQueryResult,
    IMultilingualTextRecord,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doesSomeMultilingualTextItemInclude } from '../../../../components/resources/utils/query-matchers';
import {
    filterTableData,
    Matchers,
} from '../../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { ILoadable } from '../../interfaces/loadable.interface';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';
import { buildInitialLoadableState } from '../../utils';
import { TERMS } from './constants';
import { fetchTermById, fetchTerms, IUserDefinedFilter } from './thunks';
import { TermSliceState } from './types';
import { TermIndexState } from './types/term-index-state';

export const ALL_PROPERTIES_SEARCH_KEY = '__ALL-PROPERTIES-SEARCH-KEY__';

export type IndexSearchScope<T> = keyof T | typeof ALL_PROPERTIES_SEARCH_KEY;

const buildReducersForFetchTermByIdThunk = <VThunkArg = any>(
    builder: ActionReducerMapBuilder<ILoadable<TermIndexState>>,
    thunk: AsyncThunk<IDetailQueryResult<ITermViewModel>, VThunkArg, unknown>
): void => {
    builder.addCase(thunk.pending, (state: ILoadable<TermIndexState>, _) => {
        state.isLoading = true;
    });

    builder.addCase(thunk.fulfilled, (state: ILoadable<TermIndexState>, action) => {
        const entity = action.payload;

        /**
         * Note that this is a plain-old JS object and not a map because maps
         * don't play well with tools in the Redux ecosystem for visualizing
         * and diffing state.
         */
        const existingEntitiesById = state.data?.entities || {};

        if (typeof entity === 'string') {
            existingEntitiesById[entity] = NOT_FOUND;
        } else {
            existingEntitiesById[entity.id] = entity;
        }

        state.isLoading = false;

        if (!state.data) {
            state.data = {
                page: state.data?.page,
                entities: existingEntitiesById,
                indexScopedActions: [],
                selected: [],
                count: undefined,
            };
        } else {
            state.data = {
                page: state.data.page,
                entities: existingEntitiesById,
                indexScopedActions: state.data.indexScopedActions,
                selected: [],
                count: undefined,
            };
        }

        state.data.entities = existingEntitiesById;

        /**
         * In case no index request has been sent yet (e.g., if the user has manually
         * loaded this URL from a link), we default to `[]`. This will be updated
         * with the next index request.
         */
        state.data.indexScopedActions = state.data?.indexScopedActions || [];
    });

    builder.addCase(thunk.rejected, (state: ILoadable<TermIndexState>, action) => {
        if (action.payload) {
            state.isLoading = false;
            state.errorInfo = action.payload as IHttpErrorInfo;
        } else {
            state.isLoading = false;
            state.errorInfo = {
                code: HttpStatusCode.internalError,
                message: action.error.message,
            };
        }
    });
};

const buildReducersForFetchTermsThunk = <VThunkArg = any>(
    builder: ActionReducerMapBuilder<ILoadable<TermIndexState>>,
    thunk: AsyncThunk<IIndexQueryResult<ITermViewModel>, VThunkArg, unknown>
): void => {
    builder.addCase(thunk.pending, (state: ILoadable<TermIndexState>, _) => {
        state.isLoading = true;
    });

    builder.addCase(thunk.fulfilled, (state: ILoadable<TermIndexState>, action) => {
        const { entities, indexScopedActions, page, count } = action.payload;

        /**
         * Note that this is a plain-old JS object and not a map because maps
         * don't play well with tools in the Redux ecosystem for visualizing
         * and diffing state.
         */
        const existingEntitiesById = state.data?.entities || {};

        entities.forEach((entity) => {
            existingEntitiesById[entity.id] = entity;
        });

        state.data = {
            page,
            entities: existingEntitiesById,
            indexScopedActions,
            selected: entities,
            count,
        };

        state.isLoading = false;
    });

    builder.addCase(thunk.rejected, (state: ILoadable<TermIndexState>, action) => {
        if (action.payload) {
            state.isLoading = false;
            state.errorInfo = action.payload as IHttpErrorInfo;
        } else {
            state.isLoading = false;
            state.errorInfo = {
                code: HttpStatusCode.internalError,
                message: action.error.message,
            };
        }
    });
};

const initialState: TermSliceState = {
    ...buildInitialLoadableState<TermIndexState>(),
    pageSize: 100,
};

const iterateRecord = <K extends string, V>(
    record: Record<K, V>,
    callback: (key: K, value: V) => boolean
): boolean => {
    const result = (Object.entries(record) as [K, V][]).forEach(([key, value]): boolean => {
        return callback(key, value);
    });

    return result;
};

// Need help making this work.  Type safe iteration over a record object
const matchers: Matchers<ITermViewModel> = {
    name: doesSomeMultilingualTextItemInclude,
    vocabularyListsById: (
        vocabularyListsById: Record<string, IMultilingualTextRecord>,
        searchTerm: string
    ) => {
        const isMatch = iterateRecord(vocabularyListsById, (_id, name: IMultilingualTextRecord) => {
            return doesSomeMultilingualTextItemInclude(name, searchTerm);
        });

        return isMatch;
    },

    // some(({ name }) =>
    //         name.items.some(({ text }) => doesTextIncludeCaseInsensitive(text, searchTerm))
    //     ),
    tokens: (tokens, searchTerm) =>
        (tokens || []).some(({ characters }) =>
            characters.some((c) => {
                const doesMatch = c.text === searchTerm.toLowerCase();

                if (c.isOutOfAlphabet) return false;

                return doesMatch;
            })
        ),
};

export const termSlice = createSlice({
    name: TERMS,
    initialState,
    reducers: {
        filterInMemory: (state, action) => {
            const { scope, query: searchValue } = action.payload;

            const propertiesToSearch =
                scope === ALL_PROPERTIES_SEARCH_KEY
                    ? ([
                          'name',
                          'contributions',
                          'vocabularyLists',
                          'tokens',
                          /**
                           * For some reason, `as const` leads to an incompatibility
                           * due to an incompatible `readonly` descriptor.
                           */
                      ] as (keyof ITermViewModel)[])
                    : [scope];

            const filterResult =
                searchValue === ''
                    ? Object.values(state.data.entities).filter((v) => v !== NOT_FOUND)
                    : filterTableData(
                          Object.values(state.data.entities),
                          propertiesToSearch,
                          searchValue,
                          matchers
                      );

            state.data.selected = filterResult as ITermViewModel[];

            return state;
        },
        setFilters: (
            state,
            { payload }: { payload: { filter: IUserDefinedFilter<ITermViewModel> } }
        ) => {
            state.filter = payload.filter;

            if (state.data) {
                state.data.selected = null;

                // we reset the page if the user provides a new filter becasue we don't know how many pages there will be
                state.data.page = 1;
            }

            state.isLoading = false;

            state.errorInfo = null;
        },
        // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-358] We should cache the pages until the page size or filter is changed
        changePageSize: (state, { payload: { pageSize } }: { payload: { pageSize: number } }) => {
            state.pageSize = pageSize;

            state.data = null;

            state.isLoading = false;

            state.errorInfo = null;

            return state;
        },
    },
    extraReducers: (builder) => {
        buildReducersForFetchTermsThunk(builder, fetchTerms);

        buildReducersForFetchTermByIdThunk(builder, fetchTermById);
    },
});

export const termReducer = termSlice.reducer;

/**
 * TODO At some point, we may want to generalize this for other resource types.
 * It's possible that the page size is actually a single property that is
 * shared for all resource index views.
 */
export const {
    filterInMemory: filterTermsInMemory,
    changePageSize: changePageSizeForTerms,
    setFilters: setTermFilters,
} = termSlice.actions;
