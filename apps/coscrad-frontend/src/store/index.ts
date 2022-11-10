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
    VOCABULARY_LISTS,
} from './slices/resources';
import { BIBLIOGRAPHIC_REFERENCES } from './slices/resources/bibliographic-references/constants';
import { bookReducer, BOOKS } from './slices/resources/books';
import { mediaItemReducer, MEDIA_ITEMS } from './slices/resources/media-items';
import { photographReducer } from './slices/resources/photographs';
import { PHOTOGRAPHS } from './slices/resources/photographs/constants';
import { songReducer, SONGS } from './slices/resources/songs';
import { SPATIAL_FEATURES } from './slices/resources/spatial-features/constants';
import { TERMS } from './slices/resources/terms/constants';
import { transcribedAudioReducer } from './slices/resources/transcribed-audio';
import { TRANSCRIBED_AUDIO_ITEMS } from './slices/resources/transcribed-audio/constants';
import { tagReducer } from './slices/tagSlice';
import { TAGS } from './slices/tagSlice/constants';

export const rootReducer = combineReducers({
    [RESOURCE_INFO]: resourceInfoReducer,
    [TAGS]: tagReducer,
    [NOTES]: noteReducer,
    [CATEGORY_TREE]: categoryTreeReducer,
    [TERMS]: termReducer,
    [PHOTOGRAPHS]: photographReducer,
    [TRANSCRIBED_AUDIO_ITEMS]: transcribedAudioReducer,
    // For consistency, consider pluralizing the following identifiers (constants from each slice)
    [VOCABULARY_LISTS]: vocabularyListReducer,
    [BIBLIOGRAPHIC_REFERENCES]: bibliographicReferenceReducer,
    [SPATIAL_FEATURES]: spatialFeatureReducer,
    [SONGS]: songReducer,
    [BOOKS]: bookReducer,
    [MEDIA_ITEMS]: mediaItemReducer,
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
