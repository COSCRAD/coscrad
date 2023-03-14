import { useReducer } from 'react';
import { clearForm } from './actions';
import { updateFormState } from './actions/update-form-state';
import { formStateReducer } from './form-state-reducer';

export const useFormState = (initialValue: Record<string, unknown> = {}) => {
    const [formState, dispatch] = useReducer(formStateReducer, initialValue);

    const updateForm = (propertyKey: string, value: unknown) =>
        dispatch(updateFormState(propertyKey, value));

    const clear = () => dispatch(clearForm());

    return [formState, updateForm, clear] as const;
};
