import { configureStore } from '@reduxjs/toolkit';
import alphabetSlice from './slices/alphabet-slice';

export const setupStore = () =>
    configureStore({
        reducer: {
            apiData: alphabetSlice,
        },
    });

export type RootState = ReturnType<typeof alphabetSlice>;

export type AppStore = ReturnType<typeof setupStore>;

export type AppDispatch = AppStore['dispatch'];
