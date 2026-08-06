import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../components/auth/store/auth-slice';
import { AUTH } from '../components/auth/store/constants';
import { acquireIdApi } from '../components/id-generation/store/aquire-id.api';
import { termQueryOptionsSlice } from '../components/resources/terms/store/term-query-options.slice';
import { termApi } from '../components/resources/terms/store/terms.api';
import { vocabularyListApi } from '../components/resources/vocabulary-lists/store/vocabulary-lists.api';

export const store = configureStore({
    reducer: {
        [termApi.reducerPath]: termApi.reducer,
        [vocabularyListApi.reducerPath]: vocabularyListApi.reducer,
        [acquireIdApi.reducerPath]: acquireIdApi.reducer,
        [termQueryOptionsSlice.reducerPath]: termQueryOptionsSlice.reducer,
        [AUTH]: authReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            termApi.middleware,
            vocabularyListApi.middleware,
            acquireIdApi.middleware
        );
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
