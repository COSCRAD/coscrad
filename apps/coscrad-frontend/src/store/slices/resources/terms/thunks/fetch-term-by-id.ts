import { CategorizableType, HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfig } from '../../../../../../src/config';
import { getConfigurableContent } from '../../../../../../src/configurable-front-matter';
import { RootState } from '../../../../../../src/store';
import { buildAuthenticationHeaders } from '../../../utils/build-authentication-headers';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { selectAuthToken } from '../../../utils/select-token';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';

export const fetchTermById = createAsyncThunk(
    `${buildResourceFetchActionPrefix(TERMS)}ById`,
    async (termId: string, thunkApi) => {
        const { apiUrl } = getConfig();

        const { indexToDetailFlows } = getConfigurableContent();

        const endpoint = `${getApiResourcesBaseRoute()}/terms/${termId}`;

        const { getState } = thunkApi;

        const termIndexToDetailFlowConfig = indexToDetailFlows.find(
            ({ categorizableType }) => categorizableType === CategorizableType.term
        );

        const identityFilter = (x: unknown) => x;

        const preFilter = termIndexToDetailFlowConfig?.indexFilter || identityFilter;

        const token = selectAuthToken(getState() as RootState);

        const response = await fetch(endpoint, {
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

        if (!preFilter(response)) {
            /**
             * TODO We should move this filter to the database. In that case,
             * We should filter by And(idEquals,...otherFilters).
             */
            return thunkApi.rejectWithValue({
                code: HttpStatusCode.notFound,
                message: responseJson.error,
            } as IHttpErrorInfo);
        }

        return {
            ...responseJson,

            audioURL: isNullOrUndefined(responseJson.audioURL)
                ? undefined
                : `${apiUrl}${responseJson.audioURL}`,
        };
    }
);
