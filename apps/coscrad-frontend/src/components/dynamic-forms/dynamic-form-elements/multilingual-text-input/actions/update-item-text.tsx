import { LanguageCode } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';
import { UPDATE_ITEM_TEXT } from './constants';

type UpdateItemTextPayload = {
    languageCode: LanguageCode;
    // TODO fix casing of this enum's name
    newText: string;
};

type UpdateItemTextFSA = PayloadAction<UpdateItemTextPayload, typeof UPDATE_ITEM_TEXT>;

export const isUpdateItemTextAction = (input: PayloadAction<unknown>): input is UpdateItemTextFSA =>
    (input as UpdateItemTextFSA).type === UPDATE_ITEM_TEXT;

export const updateItemText = (languageCode: LanguageCode, newText: string): UpdateItemTextFSA => ({
    type: UPDATE_ITEM_TEXT,
    payload: {
        languageCode,
        newText,
    },
});
