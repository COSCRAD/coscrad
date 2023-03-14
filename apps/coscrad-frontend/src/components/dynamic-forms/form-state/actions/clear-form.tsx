import { PayloadAction } from '@reduxjs/toolkit';
import { FORM_CLEARED } from '../constants';

type ClearedFormFSA = {
    type: typeof FORM_CLEARED;
    payload: null;
};

export const isClearedFormAction = (input: PayloadAction<unknown>): input is ClearedFormFSA =>
    (input as ClearedFormFSA).type === FORM_CLEARED;

export const clearForm = (): ClearedFormFSA => ({
    type: FORM_CLEARED,
    payload: null,
});
