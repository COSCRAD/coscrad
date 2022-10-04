import { ICommandInfo } from '@coscrad/api-interfaces';
import { ClassDataTypeMetadata } from '@coscrad/data-types';
import { CommandButton } from './CommandButton';

export type CommandInfo = {
    type: string;
    label: string;
    description: string;
    schema: ClassDataTypeMetadata;
};

interface CommandProps {
    actions: ICommandInfo[];
}

export const CommandPanel = ({ actions }: CommandProps) => (
    <div>
        <h1>Commands</h1>
        {actions.map((action) => CommandButton(action))}
    </div>
);
