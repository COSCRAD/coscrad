import { FormFieldType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation';
import { ICommandFormFieldComponent } from '../command-form-component.interface';
import { TextField } from './ConcreteFormFieldComponents/TextField';

const formFieldTypeToComponent: { [K in FormFieldType]: ICommandFormFieldComponent } = {
    [FormFieldType.textField]: TextField,
    // TextField is just a placeholder. Add custom field components for each field type.
    [FormFieldType.jsonInput]: TextField,
    [FormFieldType.numericInput]: TextField,
    [FormFieldType.staticSelect]: TextField,
    [FormFieldType.yearPicker]: TextField,
};

export const buildCommandFieldComponent = (
    formFieldType: FormFieldType
): ICommandFormFieldComponent => {
    const lookupResult = formFieldTypeToComponent[formFieldType];

    if (isNullOrUndefined(lookupResult)) {
        throw new Error(`failed to find a form field component of type: ${formFieldType}`);
    }

    return lookupResult;
};
