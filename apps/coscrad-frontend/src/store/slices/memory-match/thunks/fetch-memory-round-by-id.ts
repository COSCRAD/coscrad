import { HttpStatusCode } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../..';
import { getConfig } from '../../../../config';
import { NOT_FOUND } from '../../interfaces/maybe-loadable.interface';
import { buildAuthenticationHeaders } from '../../utils/build-authentication-headers';
import { selectAuthToken } from '../../utils/select-token';
import { MEMORY_MATCH_ROUNDS } from '../constants';

export const fetchMemoryMatchRoundById = createAsyncThunk(
    `${MEMORY_MATCH_ROUNDS}/ById`,
    async (roundId: string, thunkApi) => {
        const { getState } = thunkApi;

        const { apiUrl } = getConfig();

        const endpoint = `${apiUrl}/games/memory-match/${roundId}`;

        const token = selectAuthToken(getState() as RootState);

        const response = await fetch(endpoint, {
            headers: buildAuthenticationHeaders(token),
        });

        const responseJson =
            response.status === HttpStatusCode.notFound ? NOT_FOUND : await response.json();

        if (response.status !== HttpStatusCode.ok) {
            return thunkApi.rejectWithValue({
                code: responseJson.statusCode,
                message: responseJson.error,
            });
        }

        return responseJson;
    }
);
