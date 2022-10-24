import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';

/**
 *
 * @param actionTypePrefix prefix of the type property of generated aciton FSAs
 * @param endpoint the api endpoint to fetch from
 * @param mapResponseJsonToActionPayload an optional mapping of the response from the api call into the fulfilled action payload
 * @returns
 */
export const createFetchThunk = <TPayload>(
    actionTypePrefix: string,
    endpoint: string,
    // Part of the responsibility of the callback is to assert the type of the response
    mapResponseJsonToActionPayload: (responseJson: unknown) => TPayload = (responseJson) =>
        responseJson as TPayload
) =>
    createAsyncThunk(actionTypePrefix, async (_, thunkApi) => {
        const response = await fetch(endpoint);

        const responseJson = await response.json();

        if (response.status !== HttpStatusCode.ok)
            /**
             * TODO [https://www.pivotaltracker.com/story/show/183619131]
             *
             * We need more specific error handling that considers the format of
             * and difference between a returned error, a system error (backend runtime exception),
             * and other errors (e.g. not found, not authroized).
             */
            return thunkApi.rejectWithValue({
                code: responseJson.statusCode,
                message: responseJson.error,
            } as IHttpErrorInfo);

        return mapResponseJsonToActionPayload(responseJson);
    });
