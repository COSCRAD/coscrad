import { AuthenticatedUserInfo } from './authenticated-user-info';

export type AuthSliceState = {
    hasAuthenticatedUser: boolean;
    userInfo: AuthenticatedUserInfo;
};
