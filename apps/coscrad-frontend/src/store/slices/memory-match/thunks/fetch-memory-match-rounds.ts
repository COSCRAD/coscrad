import { HttpStatusCode } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../..';
import { getApiResourcesBaseRoute } from '../../resources/shared';
import { buildAuthenticationHeaders } from '../../utils/build-authentication-headers';
import { selectAuthToken } from '../../utils/select-token';
import { MEMORY_MATCH_ROUNDS } from '../constants';

const indexEndpoint = `${getApiResourcesBaseRoute()}/games/memory-match`;

export const fetchMemoryMatchRounds = createAsyncThunk(MEMORY_MATCH_ROUNDS, async (_, thunkApi) => {
    const { getState } = thunkApi;

    const state = getState() as RootState;

    const token = selectAuthToken(state);

    // TODO support user-defined memory-match index query filters

    // TODO support pagination
    const options = {
        pagination: {
            size: 100,
            page: 1,
        },
    };

    const headers = buildAuthenticationHeaders(token);

    const requestOptions = options
        ? {
              method: 'POST',
              headers,
              _body: JSON.stringify(options),
              get body() {
                  return this._body;
              },
              set body(value) {
                  this._body = value;
              },
          }
        : {
              method: 'POST',
              headers,
          };

    const response = await fetch(indexEndpoint, requestOptions);

    const responseJson = await response.json();

    if (response.status !== HttpStatusCode.ok) {
        return thunkApi.rejectWithValue({
            code: responseJson.statusCode,
            message: responseJson.error,
        });
    }

    return responseJson;
});
