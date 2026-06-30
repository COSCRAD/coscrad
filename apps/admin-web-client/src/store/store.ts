import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { authReducer } from '../components/auth/store/auth-slice';
import { AUTH } from '../components/auth/store/constants';
import { commandsApi } from '../components/command-status/store';
import { acquireIdApi } from '../components/id-generation/store/aquire-id.api';
import { noteApi } from '../components/notes/store/notes.api';
import { termApi } from '../components/resources/terms/store/terms.api';

export const store = configureStore({
    reducer: {
        [termApi.reducerPath]: termApi.reducer,
        [noteApi.reducerPath]: noteApi.reducer,
        [acquireIdApi.reducerPath]: acquireIdApi.reducer,
        [commandsApi.reducerPath]: commandsApi.reducer,
        [AUTH]: authReducer,
    },
    middleware: (getDefaultMiddleware) => {
        return getDefaultMiddleware().concat(
            termApi.middleware,
            noteApi.middleware,
            acquireIdApi.middleware,
            commandsApi.middleware
        );
    },
});

setupListeners(store.dispatch);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;
