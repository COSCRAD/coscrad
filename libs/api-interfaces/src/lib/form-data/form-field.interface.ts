import { IValueAndDisplay } from '../aggregate-views';
import { FormFieldType } from './form-field-type.enum';

export interface IFormField<T = unknown> {
    type: FormFieldType;
    name: string;
    label: string;
    description: string;
    options?: IValueAndDisplay<T>[];
}
