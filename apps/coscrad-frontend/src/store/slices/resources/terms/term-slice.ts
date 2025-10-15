import {
    HttpStatusCode,
    IDetailQueryResult,
    IHttpErrorInfo,
    IIndexQueryResult,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ILoadable } from '../../interfaces/loadable.interface';
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

        existingEntitiesById[entity.id] = entity;

        state.isLoading = false;

        if (!state.data) {
            state.data = {
                entities: existingEntitiesById,
                indexScopedActions: [],
            };
        } else {
            state.data = {
                entities: existingEntitiesById,
                indexScopedActions: state.data.indexScopedActions,
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

export const termSlice = createSlice({
    name: TERMS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        buildReducersForFetchTermsThunk(builder, fetchTerms);

        buildReducersForFetchTermByIdThunk(builder, fetchTermById);
    },
});

export const termReducer = termSlice.reducer;
