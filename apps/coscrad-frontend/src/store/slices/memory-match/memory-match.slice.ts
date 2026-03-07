import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createSlice } from '@reduxjs/toolkit';
import { ILoadable } from '../interfaces/loadable.interface';
import { NOT_FOUND } from '../interfaces/maybe-loadable.interface';
import { buildInitialLoadableState } from '../utils';
import { MEMORY_MATCH_ROUNDS } from './constants';
import { fetchMemoryMatchRounds } from './thunks';
import { fetchMemoryMatchRoundById } from './thunks/fetch-memory-round-by-id';
import { MemoryMatchIndexState } from './types';

const initialState = buildInitialLoadableState<MemoryMatchIndexState>(); // page size?

const MemoryMatchSlice = createSlice({
    name: MEMORY_MATCH_ROUNDS,
    initialState,
    /**
     * TODO This is where we can manage the game play state.
     */
    reducers: {},
    extraReducers: (builder) => {
        // Index queries - fetch many
        builder.addCase(
            fetchMemoryMatchRounds.pending,
            (state: ILoadable<MemoryMatchIndexState>) => {
                state.isLoading = true;
            }
        );

        builder.addCase(
            fetchMemoryMatchRounds.fulfilled,
            (state: ILoadable<MemoryMatchIndexState>, action) => {
                const { entities } = action.payload;

                const existingEntitiesById = state.data?.entities || {};

                entities.forEach((entity) => {
                    existingEntitiesById[entity.id] = entity;
                });

                state.data = {
                    page: 1, // todo fix this
                    entities: existingEntitiesById,
                    selected: entities,
                    count: entities.length, // todo fix this
                };

                state.isLoading = false;
            }
        );

        builder.addCase(
            fetchMemoryMatchRounds.rejected,
            (state: ILoadable<MemoryMatchIndexState>, action) => {
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
            }
        );

        // Detail queries - fetch by ID
        builder.addCase(
            fetchMemoryMatchRoundById.pending,
            (state: ILoadable<MemoryMatchIndexState>, _) => {
                state.isLoading = true;
            }
        );

        builder.addCase(
            fetchMemoryMatchRoundById.fulfilled,
            (state: ILoadable<MemoryMatchIndexState>, action) => {
                const entity = action.payload;

                const existingEntitiesById = state.data?.entities || {};

                if (typeof entity === 'string') {
                    existingEntitiesById[entity] = NOT_FOUND;
                } else {
                    existingEntitiesById[entity.id] = entity;
                }

                state.isLoading = false;

                if (!state.data) {
                    state.data = {
                        page: state.data.page,
                        entities: existingEntitiesById,
                        selected: [],
                        count: undefined,
                    };
                } else {
                    state.data = {
                        page: state.data.page,
                        entities: existingEntitiesById,
                        selected: [],
                        count: undefined,
                    };
                }
            }
        );

        builder.addCase(
            fetchMemoryMatchRoundById.rejected,
            (state: ILoadable<MemoryMatchIndexState>, action) => {
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
            }
        );
    },
});

export const MemoryMatchReducer = MemoryMatchSlice.reducer;
