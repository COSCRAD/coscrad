import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../components/auth/store/auth-slice';
import { idGenerationReducer } from '../components/id-generation';
import { ID_GENERATION } from '../components/id-generation/constants';
import { termApi } from '../components/resources/terms/store/terms.api';

export const store = configureStore({
    reducer: {
        [termApi.reducerPath]: termApi.reducer,
        auth: authReducer,
        [ID_GENERATION]: idGenerationReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(termApi.middleware);
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
