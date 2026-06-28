import { Action } from 'redux';
import { AuthenticatedUserInfo } from '../types/authenticated-user-info';

export const USER_LOGGED_IN = 'USER_LOGGED_IN';

export type UserLoggedInFSA = Action<typeof USER_LOGGED_IN> & { payload: AuthenticatedUserInfo };

export const userLoggedIn = ({ userId, token }: AuthenticatedUserInfo): UserLoggedInFSA => ({
    type: USER_LOGGED_IN,
    payload: { userId, token },
});
