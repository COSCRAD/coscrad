import { FormFieldType } from './form-field-type.enum';

export interface IFormField {
    type: FormFieldType;
    name: string;
    label: string;
    description: string;
    options?: unknown;
}
