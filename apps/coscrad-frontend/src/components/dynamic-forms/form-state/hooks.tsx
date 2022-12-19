import { useReducer } from 'react';
import { updateFormState } from './actions/update-form-state';
import { formStateReducer } from './form-state-reducer';

export const useFormState = () => {
    const [formState, dispatch] = useReducer(formStateReducer, {});

    const updateForm = (propertyKey: string, value: unknown) =>
        dispatch(updateFormState(propertyKey, value));

    return [formState, updateForm] as const;
};
