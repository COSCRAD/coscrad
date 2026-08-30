import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AuthenticatedUserInfo, AuthSliceState } from '../types';
import { AUTH } from './constants';

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
            console.log({ token });

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
