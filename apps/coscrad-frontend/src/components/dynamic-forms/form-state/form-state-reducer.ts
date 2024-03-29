import { PayloadAction } from '@reduxjs/toolkit';
import { isClearedFormAction } from './actions';
import { isUpdateFormAction } from './actions/update-form-state';
import { FormState } from './types';

const emptyValues = [null, undefined, ''];

const consolidateEmptyValues = (input: unknown) =>
    emptyValues.includes(input as null | undefined | '') ? undefined : input;

export const formStateReducer = (state: FormState, fsa: PayloadAction<unknown>): FormState => {
    if (isUpdateFormAction(fsa))
        return {
            // TODO [https://www.pivotaltracker.com/story/show/184066176] Deep clone
            ...state,
            [fsa.payload.propertyKey]: consolidateEmptyValues(fsa.payload.propertyValue),
        };

    if (isClearedFormAction(fsa)) return {};

    return state;
};
