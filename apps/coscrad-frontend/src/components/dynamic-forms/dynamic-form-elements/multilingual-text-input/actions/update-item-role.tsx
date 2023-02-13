import { LanguageCode, MultiLingualTextItemRole } from '@coscrad/api-interfaces';
import { PayloadAction } from '@reduxjs/toolkit';
import { UPDATE_ITEM_ROLE } from './constants';

type UpdateItemRolePayload = {
    languageCode: LanguageCode;
    newRole: MultiLingualTextItemRole;
};

type UpdateItemRoleFSA = PayloadAction<UpdateItemRolePayload>;

export const isUpdateItemRoleAction = (input: PayloadAction<unknown>): input is UpdateItemRoleFSA =>
    (input as UpdateItemRoleFSA).type === UPDATE_ITEM_ROLE;

export const updateItemRole = (
    languageCode: LanguageCode,
    newRole: MultiLingualTextItemRole
): UpdateItemRoleFSA => ({
    type: UPDATE_ITEM_ROLE,
    payload: {
        languageCode,
        newRole,
    },
});
