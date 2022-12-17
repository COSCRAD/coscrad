import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { useFormState } from '../dynamic-forms/form-state';
import { CommandButton } from './command-button';

interface CommandProps {
    actions: ICommandFormAndLabels[];
}

export const CommandPanel = ({ actions }: CommandProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm] = useFormState();

    const selectedCommand = actions.find((action) => action.type === selectedCommandType);

    if (selectedCommandType === null)
        return (
            <div>
                <h1>Commands</h1>
                {actions.map((action) =>
                    CommandButton({
                        commandFormAndLabels: action,
                        onButtonClick: (type: string) => setSelectedCommandType(type),
                    })
                )}
            </div>
        );

    return (
        <>
            <h1>Execute Command</h1>
            <div>
                Form State:
                <br />
                {JSON.stringify(formState)}
            </div>
            <div>
                You are executing: {selectedCommandType}
                <br />
                <DynamicForm
                    fields={selectedCommand.form.fields}
                    label={selectedCommand.form.label}
                    description={selectedCommand.form.description}
                    onSubmitForm={() => {
                        console.log(
                            `You submitted: ${selectedCommand.type} with payload: ${JSON.stringify(
                                formState
                            )}`
                        );

                        setSelectedCommandType(null);
                    }}
                    onFieldUpdate={updateForm}
                />
            </div>
        </>
    );
};
