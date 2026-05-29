import {
    CategorizableType,
    HttpStatusCode,
    IHttpErrorInfo,
    IIndexQueryResult,
    ITermViewModel,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfig } from '../../../../../config';
import { getConfigurableContent } from '../../../../../configurable-front-matter';
import { RootState } from '../../../../../store';
import { buildAuthenticationHeaders } from '../../../utils/build-authentication-headers';
import { buildResourceFetchActionPrefix } from '../../../utils/build-resource-fetch-action-prefix';
import { createFetchThunk } from '../../../utils/create-fetch-thunk';
import { selectAuthToken } from '../../../utils/select-token';
import { getApiResourcesBaseRoute } from '../../shared';
import { TERMS } from '../constants';
import { selectTermFilter } from '../selectors';

interface ISimpleCondition<_T> {
    type: string;

    /**
     * Type safety is difficult here. It's not just `keyof T` that are supported
     * but also things like `contributions[*].statement`.
     */
    field: string;

    operator: string;

    params: unknown[];
}
interface IComplexUserDefinedFilter<T> {
    type: string;
    conditions: ISimpleCondition<T>[];
}

export type IUserDefinedFilter<T> = IComplexUserDefinedFilter<T> | ISimpleCondition<T>;

/**
 * TODO Can we use an interface from `@api-interfaces`?
 */
export interface IUserQueryOptions {
    pagination: {
        size: number;
        page: number;
    };
}

export const fetchTerms = createAsyncThunk(
    buildResourceFetchActionPrefix(TERMS),
    async (options: Partial<IUserQueryOptions> | null, thunkApi) => {
        const { getState } = thunkApi;

        const state = getState() as RootState;

        const token = selectAuthToken(state);

        const filter = selectTermFilter(state);

        const optionsWithDefaultsApplied: IUserQueryOptions & {
            filter?: IUserDefinedFilter<ITermViewModel>;
        } = {
            pagination: options?.pagination || {
                size: 100,
                page: 1,
            },
        };

        if (filter) {
            optionsWithDefaultsApplied.filter = filter;
        }

        const headers = buildAuthenticationHeaders(token);

        const requestOptions = options
            ? {
                  method: 'POST',
                  headers,
                  body: JSON.stringify(optionsWithDefaultsApplied),
              }
            : {
                  method: 'POST',
                  headers,
              };

        const response = await fetch(`${getApiResourcesBaseRoute()}/terms`, requestOptions);

        const responseJson = await response.json();

        if (response.status !== HttpStatusCode.createdResource)
            /**
             * TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-338]
             *
             * We need more specific error handling that considers the format of
             * and difference between a returned error, a system error (backend runtime exception),
             * and other errors (e.g. not found, not authorized).
             */
            return thunkApi.rejectWithValue({
                code: responseJson.statusCode,
                message: responseJson.error,
            } as IHttpErrorInfo);

        const { apiUrl } = getConfig();

        // TODO [https://coscrad.atlassian.net/browse/CWEBJIRA-339] do this on the back-end
        const newEntitiesWithAudioUrl = responseJson.entities.flatMap((entity) => {
            return [
                {
                    ...entity,
                    audioURL: isNullOrUndefined(entity.audioURL)
                        ? undefined
                        : `${apiUrl}${entity.audioURL}`,
                },
            ];
        });

        /**
         * TODO Phase the following mapping layer out in favour
         * of doing this work on the server.
         */
        return {
            ...responseJson,
            /**
             * This updates the cache to be used for `byId` queries
             */
            entities: newEntitiesWithAudioUrl,
        };
    }
);

createFetchThunk<IIndexQueryResult<ITermViewModel>>(
    buildResourceFetchActionPrefix(TERMS),
    `${getApiResourcesBaseRoute()}/terms`,
    (serverResponse: IIndexQueryResult<ITermViewModel>): IIndexQueryResult<ITermViewModel> => {
        const { apiUrl } = getConfig();

        const { indexToDetailFlows } = getConfigurableContent();

        const termIndexToDetailFlowConfig = indexToDetailFlows.find(
            ({ categorizableType }) => categorizableType === CategorizableType.term
        );

        /**
         * TODO Phase the following mapping layer out in favour
         * of doing this work on the server.
         */
        return {
            ...serverResponse,
            entities: serverResponse.entities.flatMap((entity) => {
                return [
                    {
                        ...entity,
                        audioURL: isNullOrUndefined(entity.audioURL)
                            ? undefined
                            : `${apiUrl}${entity.audioURL}`,
                    },
                ];
            }),
        };
    }
);
