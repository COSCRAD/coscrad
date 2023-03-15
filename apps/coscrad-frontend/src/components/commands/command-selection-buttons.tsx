import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { CommandButton } from './command-button';

interface Props {
    actions: ICommandFormAndLabels[];
    onCommandSelection: (type: string) => void;
}

export const CommandSelectionButtons = ({ actions, onCommandSelection }: Props): JSX.Element => (
    <div>
        <h1>Commands</h1>
        {actions.map((action) =>
            CommandButton({
                commandFormAndLabels: action,
                onButtonClick: onCommandSelection,
            })
        )}
    </div>
);
