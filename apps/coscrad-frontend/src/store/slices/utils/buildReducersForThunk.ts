import { HttpStatusCode, IHttpErrorInfo } from '@coscrad/api-interfaces';
import { ActionReducerMapBuilder, AsyncThunk } from '@reduxjs/toolkit';
import { ILoadable } from '../interfaces/loadable.interface';

export const buildReducersForThunk = <TState extends ILoadable<unknown>, UResponsePayload>(
    builder: ActionReducerMapBuilder<TState>,
    // eslint-disable-next-line @typescript-eslint/ban-types
    thunk: AsyncThunk<UResponsePayload, void, {}>
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
            state.errorInfo = action.payload as IHttpErrorInfo;
        } else {
            state.errorInfo = {
                code: HttpStatusCode.internalError,
                message: action.error.message,
            };
        }
    });
};
