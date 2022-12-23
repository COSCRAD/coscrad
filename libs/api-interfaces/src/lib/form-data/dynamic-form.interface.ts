import { IFormField } from './form-field.interface';

export interface IDynamicForm {
    fields: IFormField[];
    prepopulatedFields?: Record<string, unknown>;
}
