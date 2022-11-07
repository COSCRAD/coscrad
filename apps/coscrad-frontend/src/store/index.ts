import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import { categoryTreeReducer } from './slices/categories';
import { CATEGORY_TREE } from './slices/categories/constants';
import { noteReducer, NOTES } from './slices/notes';

import { resourceInfoReducer, RESOURCE_INFO } from './slices/resourceInfo';
import {
    bibliographicReferenceReducer,
    spatialFeatureReducer,
    termReducer,
    vocabularyListReducer,
    VOCABULARY_LIST,
} from './slices/resources';
import { BIBLIOGRAPHIC_REFERENCE } from './slices/resources/bibliographic-references/constants';
import { photographReducer } from './slices/resources/photographs';
import { PHOTOGRAPHS } from './slices/resources/photographs/constants';
import { SPATIAL_FEATURE } from './slices/resources/spatial-features/constants';
import { TERMS } from './slices/resources/terms/constants';
import { transcribedAudioReducer } from './slices/resources/transcribed-audio';
import { TRANSCRIBED_AUDIO } from './slices/resources/transcribed-audio/constants';
import { tagReducer } from './slices/tagSlice';
import { TAGS } from './slices/tagSlice/constants';

export const rootReducer = combineReducers({
    [RESOURCE_INFO]: resourceInfoReducer,
    [TAGS]: tagReducer,
    [NOTES]: noteReducer,
    [CATEGORY_TREE]: categoryTreeReducer,
    [TERMS]: termReducer,
    [PHOTOGRAPHS]: photographReducer,
    [TRANSCRIBED_AUDIO]: transcribedAudioReducer,
    [VOCABULARY_LIST]: vocabularyListReducer,
    [BIBLIOGRAPHIC_REFERENCE]: bibliographicReferenceReducer,
    [SPATIAL_FEATURE]: spatialFeatureReducer,
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
