import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../..';
import { getConfig } from '../../../../config';
import { buildAuthenticationHeaders } from '../../utils/build-authentication-headers';
import { selectAuthToken } from '../../utils/select-token';
import { ID_GENERATION } from '../constants';

export const acquireId = createAsyncThunk(`${ID_GENERATION}/ACQUIRE_ID`, async (_, thunkApi) => {
    const { getState } = thunkApi;

    const token = selectAuthToken(getState() as RootState);

    const response = await fetch(`${getConfig().apiUrl}/ids`, {
        method: 'POST',
        headers: buildAuthenticationHeaders(token),
    });

    const responseJson = await response.text();

    if (response.status !== HttpStatusCode.ok)
        /**
         * TODO [https://www.pivotaltracker.com/story/show/183619131]
         *
         * We need more specific error handling that considers the format of
         * and difference between a returned error, a system error (backend runtime exception),
         * and other errors (e.g. not found, not authorized).
         */
        return thunkApi.rejectWithValue({
            code: response.status,
            message: `Failed to acquire an ID for an index-scoped command`,
        } as IHttpErrorInfo);

    return responseJson;
});
