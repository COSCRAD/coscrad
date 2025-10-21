import {
    HttpStatusCode,
    IDetailQueryResult,
    IHttpErrorInfo,
    IIndexQueryResult,
    ITermViewModel,
    IVocabularyListRecordForTerm,
} from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { doesSomeMultilingualTextItemInclude } from '../../../../components/resources/utils/query-matchers';
import { ALL_PROPERTIES_SEARCH_KEY } from '../../../../utils/generic-components/presenters/tables';
import {
    doesTextIncludeCaseInsensitive,
    filterTableData,
    Matchers,
} from '../../../../utils/generic-components/presenters/tables/generic-index-table-presenter/filter-table-data';
import { ILoadable } from '../../interfaces/loadable.interface';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';
import { buildInitialLoadableState } from '../../utils';
import { TERMS } from './constants';
import { fetchTermById, fetchTerms } from './thunks';
import { TermSliceState } from './types';
import { TermIndexState } from './types/term-index-state';

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
                entities: existingEntitiesById,
                indexScopedActions: [],
                selected: [],
            };
        } else {
            state.data = {
                entities: existingEntitiesById,
                indexScopedActions: state.data.indexScopedActions,
                selected: [],
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
        const { entities, indexScopedActions } = action.payload;

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
            entities: existingEntitiesById,
            indexScopedActions,
            selected: entities,
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

const initialState: TermSliceState = buildInitialLoadableState<TermIndexState>();

const matchers: Matchers<ITermViewModel> = {
    name: doesSomeMultilingualTextItemInclude,
    vocabularyLists: (vocabularyLists: IVocabularyListRecordForTerm[], searchTerm: string) =>
        vocabularyLists.some(({ name }) =>
            name.items.some(({ text }) => doesTextIncludeCaseInsensitive(text, searchTerm))
        ),
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
        filter: (state, action) => {
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
                    ? state.data.entities
                    : filterTableData(
                          /**
                           * TODO Make it so that the filtering logic ignores `NOT_FOUND` instead
                           */
                          Object.values(state.data.entities).filter(
                              (val) => val !== NOT_FOUND
                          ) as ITermViewModel[],
                          propertiesToSearch,
                          searchValue,
                          matchers
                      );

            console.log({
                searchValue,
                filterResult,
            });

            // @ts-expect-error Fix this issue with not found
            state.data.selected = filterResult;

            return state;
        },
    },
    extraReducers: (builder) => {
        buildReducersForFetchTermsThunk(builder, fetchTerms);

        buildReducersForFetchTermByIdThunk(builder, fetchTermById);
    },
});

export const termReducer = termSlice.reducer;

export const { filter: filterTerms } = termSlice.actions;
