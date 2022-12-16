import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { CommandButton } from './command-button';

interface CommandProps {
    actions: ICommandFormAndLabels[];
}

export const CommandPanel = ({ actions }: CommandProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const selectedCommand = actions.find((action) => action.type == selectedCommandType);

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
                You are executing: {selectedCommandType}
                <br />
                <DynamicForm
                    fields={selectedCommand.form.fields}
                    label={selectedCommand.form.label}
                    description={selectedCommand.form.description}
                />
                <button onClick={() => setSelectedCommandType(null)}>SUBMIT</button>
            </div>
        </>
    );
};
