import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { combineReducers } from 'redux';
import { authReducer } from '../components/auth/store/auth-slice';
import { AUTH } from '../components/auth/store/constants';
import { acquireIdApi } from '../components/id-generation/store/aquire-id.api';
import { spatialFeatureApi } from '../components/resources/spatial-features/store/spatial-feature.api';
import { termIndexQueryOptionsSlice } from '../components/resources/terms/store/term-index-query-options.slice';
import { termApi } from '../components/resources/terms/store/term.api';
import { vocabularyListApi } from '../components/resources/vocabulary-lists/store/vocabulary-lists.api';
import { contributorIndexQueryOptionsSlice } from '../components/shared/contributors/store/contributor-index-query-options.slice';
import { contributorApi } from '../components/shared/contributors/store/contributor.api';

const rootReducer = combineReducers({
    [termApi.reducerPath]: termApi.reducer,
    [spatialFeatureApi.reducerPath]: spatialFeatureApi.reducer,
    [vocabularyListApi.reducerPath]: vocabularyListApi.reducer,
    [contributorApi.reducerPath]: contributorApi.reducer,
    [acquireIdApi.reducerPath]: acquireIdApi.reducer,
    termIndexQueryOptionsSlice: termIndexQueryOptionsSlice.reducer,
    contributorIndexQueryOptionsSlice: contributorIndexQueryOptionsSlice.reducer,
    [AUTH]: authReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export const store = configureStore({
    reducer: rootReducer,
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            termApi.middleware,
            spatialFeatureApi.middleware,
            vocabularyListApi.middleware,
            contributorApi.middleware,
            acquireIdApi.middleware
        );
    },
});

setupListeners(store.dispatch);

export type AppDispatch = typeof store.dispatch;
