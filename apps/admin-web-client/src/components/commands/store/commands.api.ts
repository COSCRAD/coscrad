import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { RootState } from '../../../store';

interface CommandResponse {
    type: string;
    id: string;
    revision: string;
}

interface CommandFsa {
    type: string;
    payload: unknown;
}

export const commandsApi = createApi({
    reducerPath: 'commands',
    tagTypes: ['command'],
    baseQuery: fetchBaseQuery({
        baseUrl: `${getConfig().apiUrl}/`,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.userAuthInfo.token;

            if (token) {
                headers.set('authorization', `Bearer ${token}`);
            }

            return headers;
        },
    }),
    endpoints: (build) => ({
        executeCommand: build.mutation<CommandResponse, CommandFsa, unknown>({
            query: (commandFsa) => ({
                url: `commands`,
                method: 'POST',
                responseHandler: 'text',
                body: commandFsa,
            }),
        }),
    }),
});

export const { useExecuteCommandMutation } = commandsApi;
