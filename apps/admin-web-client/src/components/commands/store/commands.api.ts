import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { getConfig } from '../../../config';
import { RootState } from '../../../store';
import { noteApi } from '../../notes/store';
import { termApi } from '../../resources/terms/store';

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
            async onQueryStarted(arg, { dispatch, queryFulfilled }) {
                try {
                    await queryFulfilled;
                    // Explicitly invalidate tags
                    dispatch(noteApi.util.invalidateTags(['note']));
                    dispatch(termApi.util.invalidateTags(['term']));
                    // eslint-disable-next-line no-empty
                } catch {}
            },
        }),
    }),
});

export const { useExecuteCommandMutation } = commandsApi;
