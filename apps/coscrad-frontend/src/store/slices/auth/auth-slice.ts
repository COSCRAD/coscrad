import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AUTH } from './constants';
import { AuthSliceState } from './types';
import { AuthenticatedUserInfo } from './types/authenticated-user-info';

export const initialState: AuthSliceState = {
    hasAuthenticatedUser: false,
    userAuthInfo: null,
};

export const authSlice = createSlice({
    name: AUTH,
    initialState,
    reducers: {
        userLoginSucceeded: (
            _: AuthSliceState,
            { payload: { userId, token } }: PayloadAction<AuthenticatedUserInfo>
        ) => {
            // Note that Immer will handle this uptate immutably
            return {
                hasAuthenticatedUser: true,
                userAuthInfo: { userId, token },
            };
        },
        userLoggedOut: (_: AuthSliceState) => {
            return {
                hasAuthenticatedUser: false,
                userAuthInfo: null,
            };
        },
    },
});

export const { userLoginSucceeded, userLoggedOut } = authSlice.actions;

export const authReducer = authSlice.reducer;
