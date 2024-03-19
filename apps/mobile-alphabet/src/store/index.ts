import { PreloadedState, combineReducers, configureStore } from '@reduxjs/toolkit';
import { ALPHABET, alphabetReducer } from './slices/alphabet-slice';

const rootReducer = combineReducers({
    [ALPHABET]: alphabetReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
    });

export type RootState = ReturnType<typeof rootReducer>;

export type AppStore = ReturnType<typeof setupStore>;

export type AppDispatch = AppStore['dispatch'];
