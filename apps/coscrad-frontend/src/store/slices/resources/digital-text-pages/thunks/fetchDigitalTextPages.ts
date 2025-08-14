import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../../..';
import { buildAuthenticationHeaders } from '../../../utils/build-authentication-headers';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { selectAuthToken } from '../../../utils/select-token';
import { getApiResourcesBaseRoute } from '../../shared';
import { DIGITAL_TEXT_PAGES } from '../constants';
import { DigitalTextPagesIndexState } from '../types';

export const fetchDigitalTextPages = (id: string) =>
    createFetchThunk<DigitalTextPagesIndexState>(
        buildResourceFetchActionPrefix(DIGITAL_TEXT_PAGES),
        `${getApiResourcesBaseRoute()}/digitalTexts/pages/${id}`
    );

export const fetchDigitalTextPagesByDigitalTextId = <DigitalTextPagesIndexState>(
    id: string,
    actionTypePrefix: string,
    mapResponseJsonToActionPayload: (responseJson: unknown) => DigitalTextPagesIndexState = (
        responseJson
    ) => responseJson as DigitalTextPagesIndexState
) =>
    createAsyncThunk(actionTypePrefix, async (_, thunkApi) => {
        const { getState } = thunkApi;

        const token = selectAuthToken(getState() as RootState);

        const response = await fetch(`${getApiResourcesBaseRoute()}/digitalTexts/pages/${id}`, {
            headers: buildAuthenticationHeaders(token),
        });
        const responseJson = await response.json();

        if (response.status !== HttpStatusCode.ok)
            /**
             * TODO [https://www.pivotaltracker.com/story/show/183619131]
             *
             * We need more specific error handling that considers the format of
             * and difference between a returned error, a system error (backend runtime exception),
             * and other errors (e.g. not found, not authorized).
             */
            return thunkApi.rejectWithValue({
                code: responseJson.statusCode,
                message: responseJson.error,
            } as IHttpErrorInfo);

        return mapResponseJsonToActionPayload(responseJson);
    });
