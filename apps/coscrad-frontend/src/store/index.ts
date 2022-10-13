import { configureStore } from '@reduxjs/toolkit';
import { resourcesSlice } from './slices/ResourcesSlice';

export const store = configureStore({
    reducer: {
        resources: resourcesSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
