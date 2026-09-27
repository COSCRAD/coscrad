import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ILoadable } from '../interfaces/loadable.interface';
import { NOT_FOUND } from '../interfaces/maybe-loadable.interface';
import { buildInitialLoadableState } from '../utils';
import { MEMORY_MATCH_ROUNDS } from './constants';
import {
    cardFlippedDownReducer,
    cardFlippedUpReducer,
    matchingCardsClearedReducer,
    roundResetReducer,
} from './reducers';
import { cardsHiddenReducer } from './reducers/cards-hidden.reducer';
import { fetchMemoryMatchRounds } from './thunks';
import { fetchMemoryMatchRoundById } from './thunks/fetch-memory-round-by-id';
import { MemoryMatchIndexState } from './types';
import { MemoryMatchActiveRound } from './types/memory-match-active-round';

const initialState = buildInitialLoadableState<MemoryMatchIndexState>(); // page size?

type ActiveRoundReducer<T> = (
    state: MemoryMatchActiveRound,
    action: PayloadAction<T>
) => MemoryMatchActiveRound;

type MemoryMatchReducer<T> = (
    state: ILoadable<MemoryMatchIndexState>,
    action: PayloadAction<T>
) => ILoadable<MemoryMatchIndexState>;

const bindActiveRoundReducer = <T>(reducer: ActiveRoundReducer<T>): MemoryMatchReducer<T> => {
    const boundReducer: MemoryMatchReducer<T> = (
        state: ILoadable<MemoryMatchIndexState>,
        action: PayloadAction<T>
    ) => {
        if (!state.data?.active) {
            return state;
        }

        state.data.active = reducer(state.data.active, action);

        return state;
    };

    return boundReducer;
};

const memoryMatchSlice = createSlice({
    name: MEMORY_MATCH_ROUNDS,
    initialState,
    reducers: {
        cardFlippedUp: bindActiveRoundReducer(cardFlippedUpReducer),
        cardFlippedDown: bindActiveRoundReducer(cardFlippedDownReducer),
        roundReset: bindActiveRoundReducer(roundResetReducer),
        matchingCardsCleared: bindActiveRoundReducer(matchingCardsClearedReducer),
        cardsHidden: bindActiveRoundReducer(cardsHiddenReducer),
    },
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

export const { cardFlippedDown, cardFlippedUp, matchingCardsCleared, cardsHidden, roundReset } =
    memoryMatchSlice.actions;

export const MemoryMatchReducer = memoryMatchSlice.reducer;
