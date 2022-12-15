import { RootState } from '../../..';
import { AUTH } from '../constants';

export const selectAuthenticatedUser = (state: RootState) => {
    const { userInfo, hasAuthenticatedUser } = state[AUTH];

    if (!hasAuthenticatedUser) return null;

    // TODO join in actual user profile
    return userInfo;
};
