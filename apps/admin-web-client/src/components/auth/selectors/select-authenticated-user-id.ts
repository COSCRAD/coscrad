import { NOT_FOUND } from '../../../interfaces/maybe-loadable.interface';
import { RootState } from '../../../store';
import { AUTH } from '../store/constants';

export const selectAuthenticatedUserId = (state: RootState): string | typeof NOT_FOUND => {
    const userSliceState = state[AUTH];

    const { hasAuthenticatedUser } = userSliceState;

    if (!hasAuthenticatedUser) return NOT_FOUND;

    const {
        userAuthInfo: { userId },
    } = userSliceState;

    return userId;
};
