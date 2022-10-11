import { FormFieldType, IFormData } from '../form-data';

export interface ICommandFormAndLabels {
    description: string;
    label: string;
    type: FormFieldType;
    form: IFormData;
}
