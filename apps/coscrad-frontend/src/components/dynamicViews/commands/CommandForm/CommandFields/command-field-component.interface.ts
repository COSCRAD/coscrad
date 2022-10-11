import { IFormField } from '@coscrad/api-interfaces';

export interface ICommandFormFieldComponent {
    (props: IFormField): JSX.Element;
}
