import { FluxStandardAction, HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { RootState } from '../../..';
import { getConfig } from '../../../../config';
import { buildAuthenticationHeaders } from '../../utils/build-authentication-headers';
import { selectAuthToken } from '../../utils/select-token';
import { COMMAND_STATUS } from '../constants';
import { Ack } from '../types';

export const executeCommand = createAsyncThunk(
    `${COMMAND_STATUS}/EXECUTE_COMMAND`,
    async (commandFSA: FluxStandardAction<unknown, string>, thunkApi) => {
        const { getState } = thunkApi;

        const token = selectAuthToken(getState() as RootState);

        const response = await fetch(`${getConfig().apiUrl}/commands`, {
            method: 'POST',
            headers: buildAuthenticationHeaders(token),
            body: JSON.stringify(commandFSA),
        });

        // The command failed or there was some other network / authorization error
        if (response.status !== HttpStatusCode.ok) {
            const responseJson = await response.json();

            return thunkApi.rejectWithValue({
                code: response.status,
                message: responseJson,
            } as IHttpErrorInfo);
        }

        /**
         * We may want a more sophisticated pattern for acquiring generated IDs
         * from the ID generation service. For example, we may want to obtain
         * several IDs to queue up.
         */
        // dispatch(acquireId());

        // The command succeeded
        return Ack;
    }
);
