import { IDynamicForm } from '../form-data/dynamic-form.interface';

export interface ICommandFormAndLabels {
    label: string;
    description: string;
    form: IDynamicForm;
    type: string;
}
