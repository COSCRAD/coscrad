import { IDynamicForm } from '../form-data/dynamic-form.interface';

export interface ICommandMeta {
    label: string;
    description: string;
    type: string;
}

export interface ICommandFormAndLabels extends ICommandMeta {
    form: IDynamicForm;
}
