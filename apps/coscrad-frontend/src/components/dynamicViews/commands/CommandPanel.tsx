import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { CommandButton } from './CommandButton';

interface CommandProps {
    actions: ICommandFormAndLabels[];
}

export const CommandPanel = ({ actions }: CommandProps) => (
    <div>
        <h1>Commands</h1>
        {actions.map((action) => CommandButton(action))}
    </div>
);
