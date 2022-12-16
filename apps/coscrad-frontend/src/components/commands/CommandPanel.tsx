import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { useState } from 'react';
import { CommandButton } from './CommandButton';

interface CommandProps {
    actions: ICommandFormAndLabels[];
}

export const CommandPanel = ({ actions }: CommandProps) => {
    const [selectedCommand, setSelectedCommand] = useState(null);

    if (selectedCommand === null)
        return (
            <div>
                <h1>Commands</h1>
                {actions.map((action) =>
                    CommandButton({
                        commandFormAndLabels: action,
                        onButtonClick: (type: string) => setSelectedCommand(type),
                    })
                )}
            </div>
        );

    return (
        <>
            <h1>Execute Command</h1>
            <div>
                You are executing: {selectedCommand}
                <br />
                <button onClick={() => setSelectedCommand(null)}>SUBMIT</button>
            </div>
        </>
    );
};
