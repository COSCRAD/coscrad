import { combineReducers, configureStore, PreloadedState } from '@reduxjs/toolkit';
import { AUTH, authReducer } from './slices/auth';
import { categoryTreeReducer } from './slices/categories';
import { CATEGORY_TREE } from './slices/categories/constants';
import { COMMAND_STATUS, commandStatusReducer } from './slices/command-status';
import { idGenerationReducer } from './slices/id-generation';
import { ID_GENERATION } from './slices/id-generation/constants';
import { noteReducer, NOTES } from './slices/notes';

import {
    AUDIO_ITEMS,
    audioItemReducer,
    BIBLIOGRAPHIC_CITATIONS,
    bibliographicCitationReducer,
    bookReducer,
    BOOKS,
    DIGITAL_TEXTS,
    DigitalTextReducer,
    MEDIA_ITEMS,
    mediaItemReducer,
    photographReducer,
    PHOTOGRAPHS,
    PlaylistReducer,
    PLAYLISTS,
    RESOURCE_INFO,
    resourceInfoReducer,
    songReducer,
    SONGS,
    SPATIAL_FEATURES,
    spatialFeatureReducer,
    termReducer,
    TERMS,
    videoReducer,
    VIDEOS,
    VOCABULARY_LISTS,
    vocabularyListReducer,
} from './slices/resources';
import { tagReducer, TAGS } from './slices/tagSlice';

export const rootReducer = combineReducers({
    [AUTH]: authReducer,
    [ID_GENERATION]: idGenerationReducer,
    [COMMAND_STATUS]: commandStatusReducer,
    [RESOURCE_INFO]: resourceInfoReducer,
    [TAGS]: tagReducer,
    [NOTES]: noteReducer,
    [CATEGORY_TREE]: categoryTreeReducer,
    [TERMS]: termReducer,
    [PHOTOGRAPHS]: photographReducer,
    [AUDIO_ITEMS]: audioItemReducer,
    [VIDEOS]: videoReducer,
    // For consistency, consider pluralizing the following identifiers (constants from each slice)
    [VOCABULARY_LISTS]: vocabularyListReducer,
    [BIBLIOGRAPHIC_CITATIONS]: bibliographicCitationReducer,
    [DIGITAL_TEXTS]: DigitalTextReducer,
    [SPATIAL_FEATURES]: spatialFeatureReducer,
    [SONGS]: songReducer,
    [BOOKS]: bookReducer,
    [MEDIA_ITEMS]: mediaItemReducer,
    [PLAYLISTS]: PlaylistReducer,
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
