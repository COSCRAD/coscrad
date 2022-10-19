import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import { resourceInfoReducer, RESOURCE_INFO } from './slices/resourceInfoSlice';

export const rootReducer = combineReducers({
    [RESOURCE_INFO]: resourceInfoReducer,
});

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
    });

export type RootState = ReturnType<typeof rootReducer>;

// ReturnType<typeof setupStore> if currying to inject additional setup
export type AppStore = ReturnType<typeof setupStore>;

export type AppDispatch = AppStore['dispatch'];
