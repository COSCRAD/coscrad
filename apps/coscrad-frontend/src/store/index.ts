import { combineReducers, configureStore, PayloadAction, PreloadedState } from '@reduxjs/toolkit';
import { AUTH, authReducer } from './slices/auth';
import { categoryTreeReducer } from './slices/categories';
import { CATEGORY_TREE } from './slices/categories/constants';
import { commandStatusReducer, COMMAND_STATUS } from './slices/command-status';
import { idGenerationReducer } from './slices/id-generation';
import { ID_GENERATION } from './slices/id-generation/constants';
import { noteReducer, NOTES } from './slices/notes';

import { resourceInfoReducer, RESOURCE_INFO } from './slices/resource-info-slice';
import {
    bibliographicReferenceReducer,
    spatialFeatureReducer,
    termReducer,
    vocabularyListReducer,
    VOCABULARY_LISTS,
} from './slices/resources';
import { audioItemReducer } from './slices/resources/audio-item';
import { AUDIO_ITEMS } from './slices/resources/audio-item/constants';
import { BIBLIOGRAPHIC_REFERENCES } from './slices/resources/bibliographic-references/constants';
import { bookReducer, BOOKS } from './slices/resources/books';
import { mediaItemReducer, MEDIA_ITEMS } from './slices/resources/media-items';
import { photographReducer } from './slices/resources/photographs';
import { PHOTOGRAPHS } from './slices/resources/photographs/constants';
import { PLAYLISTS } from './slices/resources/playlists';
import { PlaylistReducer } from './slices/resources/playlists/playlist-slice';
import { songReducer, SONGS } from './slices/resources/songs';
import { SPATIAL_FEATURES } from './slices/resources/spatial-features/constants';
import { TERMS } from './slices/resources/terms/constants';
import { videoReducer } from './slices/resources/video';
import { VIDEOS } from './slices/resources/video/constants';
import { tagReducer } from './slices/tagSlice';
import { TAGS } from './slices/tagSlice/constants';

const appReducer = combineReducers({
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
    [BIBLIOGRAPHIC_REFERENCES]: bibliographicReferenceReducer,
    [SPATIAL_FEATURES]: spatialFeatureReducer,
    [SONGS]: songReducer,
    [BOOKS]: bookReducer,
    [MEDIA_ITEMS]: mediaItemReducer,
    [PLAYLISTS]: PlaylistReducer,
});

const RESET_APP = 'RESET_APP';

export const resetApp = () => ({
    type: RESET_APP,
});

export type RootState = ReturnType<typeof appReducer>;

export const rootReducer = (state: RootState, action: PayloadAction) => {
    if (action.type === RESET_APP) return undefined;

    return appReducer(state, action);
};

export const setupStore = (preloadedState?: PreloadedState<RootState>) =>
    configureStore({
        reducer: rootReducer,
        preloadedState,
    });

// ReturnType<typeof setupStore> if currying to inject additional setup
export type AppStore = ReturnType<typeof setupStore>;

export type AppDispatch = AppStore['dispatch'];
