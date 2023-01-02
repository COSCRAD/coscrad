import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
import { ILoadable } from '../interfaces/loadable.interface';

export const buildReducersForThunk = <
    TState extends ILoadable<unknown>,
    UResponsePayload,
    VThunkArg = unknown
>(
    builder: ActionReducerMapBuilder<TState>,
    thunk: AsyncThunk<UResponsePayload, VThunkArg, unknown>
): void => {
    // @ts-expect-error fix types
    builder.addCase(thunk.pending, (state: TState, _) => {
        state.isLoading = true;
    });

    // @ts-expect-error fix types
    builder.addCase(thunk.fulfilled, (state: TState, action) => {
        state.data = action.payload;
        state.isLoading = false;
    });

    // @ts-expect-error fix types
    builder.addCase(thunk.rejected, (state: TState, action) => {
        if (action.payload) {
            state.isLoading = false;
            state.errorInfo = action.payload as IHttpErrorInfo;
        } else {
            state.isLoading = false;
            state.errorInfo = {
                code: HttpStatusCode.internalError,
                message: action.error.message,
            };
        }
    });
};
