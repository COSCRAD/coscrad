import { RootState } from '../..';

export const selectAuthToken = (state: RootState) => state['auth']?.userAuthInfo?.token;
