import { ClassDataTypeMetadata } from '@coscrad/data-types';
import { CommandButton } from './CommandButton';

export type CommandInfo = {
    type: string;
    label: string;
    description: string;
    schema: ClassDataTypeMetadata;
};

interface CommandProps {
    actions: CommandInfo[];
}

export const CommandPanel = ({ actions }: CommandProps) => (
    <div>
        <h1>Commands</h1>
        {actions.map((action) => CommandButton(action))}
    </div>
);
