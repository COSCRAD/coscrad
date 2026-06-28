import { RootState } from '../../store';

export const selectAuthToken = (state: RootState) => state['auth']?.userAuthInfo?.token;
