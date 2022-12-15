import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTH } from './constants';
import { AuthSliceState } from './types';
import { AuthenticatedUserInfo } from './types/authenticated-user-info';

export const initialState: AuthSliceState = {
    hasAuthenticatedUser: false,
    userInfo: null,
};

export const authSlice = createSlice({
    name: AUTH,
    initialState,
    reducers: {
        userLoginSucceeded: (
            state: AuthSliceState,
            { payload: { userId, token } }: PayloadAction<AuthenticatedUserInfo>
        ) => {
            // Note that Immer will handle this uptate immutably
            state = {
                hasAuthenticatedUser: true,
                userInfo: { userId, token },
            };

            return state;
        },
        userLoggedOut: (state: AuthSliceState) => {
            state = {
                hasAuthenticatedUser: false,
                userInfo: null,
            };

            return state;
        },
    },
});

export const { userLoginSucceeded, userLoggedOut } = authSlice.actions;

export const authReducer = authSlice.reducer;
