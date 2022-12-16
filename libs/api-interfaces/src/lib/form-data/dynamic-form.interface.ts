import { IFormField } from './form-field.interface';

export interface IDynamicForm {
    description: string;
    label: string;
    fields: IFormField[];
}
