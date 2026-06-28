import { RootState } from '../../../store';
import { AUTH } from '../store/constants';

export const selectAuthenticatedUser = (state: RootState) => {
    const { userAuthInfo, hasAuthenticatedUser } = state[AUTH];

    if (!hasAuthenticatedUser) return null;

    // TODO join in actual user profile
    return userAuthInfo;
};
