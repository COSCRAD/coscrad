import { RootState } from '../../..';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';
import { AUTH } from '../constants';

export const selectAuthenticatedUserId = (state: RootState): string | typeof NOT_FOUND => {
    const userSliceState = state[AUTH];

    const { hasAuthenticatedUser } = userSliceState;

    if (!hasAuthenticatedUser) return NOT_FOUND;

    const {
        userAuthInfo: { userId },
    } = userSliceState;

    return userId;
};
