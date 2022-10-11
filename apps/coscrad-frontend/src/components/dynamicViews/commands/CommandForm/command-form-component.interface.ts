import { IFormField } from '@coscrad/api-interfaces';

export interface ICommandFormFieldComponent {
    (formProps: IFormField): JSX.Element;
}
