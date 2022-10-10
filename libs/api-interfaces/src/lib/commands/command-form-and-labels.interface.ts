import { IFormData } from '../form-data';

export interface ICommandFormAndLabels {
    description: string;
    label: string;
    type: string;
    form: IFormData;
}
