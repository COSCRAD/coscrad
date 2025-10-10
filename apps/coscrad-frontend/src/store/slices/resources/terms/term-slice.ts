import {
    HttpStatusCode,
    IHttpErrorInfo,
    IIndexQueryResult,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ILoadable } from '../../interfaces/loadable.interface';
import { buildInitialLoadableState } from '../../utils';
import { TERMS } from './constants';
import { fetchTerms } from './thunks';
import { TermSliceState } from './types';
import { TermIndexState } from './types/term-index-state';

const buildReducersForFetchTermThunk = <VThunkArg = unknown>(
    builder: ActionReducerMapBuilder<ILoadable<TermIndexState>>,
    thunk: AsyncThunk<IIndexQueryResult<ITermViewModel>, VThunkArg, unknown>
): void => {
    builder.addCase(thunk.pending, (state: ILoadable<TermIndexState>, _) => {
        state.isLoading = true;
    });

    builder.addCase(thunk.fulfilled, (state: ILoadable<TermIndexState>, action) => {
        const { entities, indexScopedActions } = action.payload;

        const existingEntitiesMap = state.data?.entities || {};

        entities.forEach((entity) => {
            existingEntitiesMap[entity.id] = entity;
        });

        console.log({
            entities,
            existingEntitiesMap,
            size: Array.from(Object.keys(existingEntitiesMap)).length,
        });

        state.data = {
            entities: existingEntitiesMap,
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
        buildReducersForFetchTermThunk(builder, fetchTerms);
    },
});

export const termReducer = termSlice.reducer;
