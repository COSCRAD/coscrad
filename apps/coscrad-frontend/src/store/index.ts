import { configureStore } from '@reduxjs/toolkit';
import { resourceInfoSlice } from './slices/resourceInfoSlice';

export const store = configureStore({
    reducer: {
        resources: resourceInfoSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;

// ReturnType<typeof setupStore> if currying to inject additional setup
export type AppStore = typeof store;

export type AppDispatch = AppStore['dispatch'];
