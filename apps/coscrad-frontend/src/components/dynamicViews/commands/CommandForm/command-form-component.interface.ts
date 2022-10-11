import { IFormField } from '@coscrad/api-interfaces';
import React from 'react';

export type FormChangeEvent = React.ChangeEvent<HTMLInputElement>;

export interface IFormEventHandler {
    (e: FormChangeEvent): void;
}

export interface IHasOnChange {
    onChange: IFormEventHandler;
}

export interface ICommandFormFieldComponent {
    (formProps: IFormField & IHasOnChange & { value: string }): JSX.Element;
}
