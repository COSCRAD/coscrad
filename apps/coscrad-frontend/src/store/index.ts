import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import { categoryTreeReducer } from './slices/categorySlice';
import { CATEGORY_TREE } from './slices/categorySlice/constants';
import { noteReducer, NOTES } from './slices/noteSlice';

import { resourceInfoReducer, RESOURCE_INFO } from './slices/resourceInfoSlice';
import { tagReducer } from './slices/tagSlice';
import { TAGS } from './slices/tagSlice/constants';

export const rootReducer = combineReducers({
    [RESOURCE_INFO]: resourceInfoReducer,
    [TAGS]: tagReducer,
    [NOTES]: noteReducer,
    [CATEGORY_TREE]: categoryTreeReducer,
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
