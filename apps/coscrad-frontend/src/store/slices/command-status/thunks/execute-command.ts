import { FluxStandardAction, HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { createAsyncThunk } from '@reduxjs/toolkit';
import { getConfig } from '../../../../config';
import { buildAuthenticationHeaders } from '../../utils/build-authentication-headers';
import { COMMAND_STATUS } from '../constants';
import { Ack } from '../types';

export const executeCommand = createAsyncThunk(
    `${COMMAND_STATUS}/EXECUTE_COMMAND`,
    async (commandFSA: FluxStandardAction<unknown, string>, thunkApi) => {
        const { getState } = thunkApi;

        // TODO Share this with `acquireId`
        const token = getState()['auth']?.userAuthInfo?.token;

        console.log({ postingCommand: commandFSA });

        const response = await fetch(`${getConfig().apiUrl}/commands`, {
            method: 'POST',
            headers: buildAuthenticationHeaders(token),
            body: JSON.stringify(commandFSA),
        });

        const responseJson = await response.json();

        // The command failed or there was some other network / authorization error
        if (response.status !== HttpStatusCode.ok)
            return thunkApi.rejectWithValue({
                code: response.status,
                message: responseJson,
            } as IHttpErrorInfo);

        // The command succeeded
        return Ack;
    }
);
