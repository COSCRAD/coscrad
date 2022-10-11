import { ICommandFormAndLabels, IFormField } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { FormChangeEvent } from './command-form-component.interface';
import { buildCommandFieldComponent } from './CommandFields/buildCommandFieldComponent';

type FormState = Record<string, unknown>;

const buildInitialState = (fields: IFormField[]): FormState =>
    fields.reduce(
        (acc: FormState, { name }) => ({
            ...acc,
            [name]: null,
        }),
        {}
    );

/**
 * Eventually, we may want to inject a different presentational component
 * depending on a config (e.g. for React native instead of react web.
 */
export const ComamndForm = ({
    type,
    label,
    description,
    form,
}: ICommandFormAndLabels): JSX.Element => {
    const [formState, setFormState] = useState(buildInitialState(form.fields));

    const updateFormOnFieldChange = (oldState: FormState, name: string, newValue: unknown): void =>
        setFormState({
            ...oldState,
            [name]: newValue,
        });

    return (
        <div>
            <h1>Command: [{label}]</h1>
            <h2>{description}</h2>
            <form
                onSubmit={(e) => {
                    e.preventDefault();

                    console.log(`Submitted command of type: ${type}`);
                    console.log({ formState: JSON.parse(JSON.stringify(formState)) });
                }}
            >
                {form.fields.map(
                    ({ description, name, type: fieldType, label: fieldLabel, options }) => {
                        const CommandFieldComponent = buildCommandFieldComponent(fieldType);

                        return (
                            <div>
                                <CommandFieldComponent
                                    {...{
                                        description,
                                        name,
                                        type: fieldType,
                                        label: fieldLabel,
                                        options,
                                        value: formState[name] as string,
                                        onChange: (event: FormChangeEvent) =>
                                            updateFormOnFieldChange(
                                                formState,
                                                name,
                                                event.target.value
                                            ),
                                    }}
                                ></CommandFieldComponent>
                            </div>
                        );
                    }
                )}
                <div>
                    <input type="submit" value="Submit"></input>
                </div>
            </form>
        </div>
    );
};
