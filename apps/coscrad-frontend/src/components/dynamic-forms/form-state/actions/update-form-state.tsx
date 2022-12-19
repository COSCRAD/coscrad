import { PayloadAction } from '@reduxjs/toolkit';
import { FORM_UPDATED } from '../constants';

type UpdatedFormStatePayload = {
    propertyKey: string;
    propertyValue: unknown;
};

type UpdateFormStateFSA = PayloadAction<UpdatedFormStatePayload, typeof FORM_UPDATED>;

export const isUpdateFormAction = (input: PayloadAction<unknown>): input is UpdateFormStateFSA =>
    (input as UpdateFormStateFSA).type === FORM_UPDATED;

export const updateFormState = (propertyKey, propertyValue): UpdateFormStateFSA => ({
    type: FORM_UPDATED,
    payload: {
        propertyKey,
        propertyValue,
    },
});
