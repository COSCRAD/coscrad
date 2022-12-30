import { createSlice } from '@reduxjs/toolkit';
import { buildInitialLoadableState } from '../utils';
import { buildReducersForThunk } from '../utils/build-reducers-for-thunk';
import { COMMAND_STATUS } from './constants';
import { executeCommand } from './thunks';
import { CommandResult } from './types';
import { CommandStatusSliceState } from './types/command-status-slice-state';

export const initialState: CommandStatusSliceState = buildInitialLoadableState<CommandResult>();

export const commandStatusSlice = createSlice({
    name: COMMAND_STATUS,
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        // @ts-expect-error FIX types
        buildReducersForThunk(builder, executeCommand);
    },
});

export const commandStatusReducer = commandStatusSlice.reducer;
