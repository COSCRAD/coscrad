import { ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { CommandButton } from './command-button';

interface CommandSelectionAreaProps {
    actions: ICommandFormAndLabels[];
    onCommandSelection: (type: string) => void;
}

export const CommandSelectionArea = ({
    actions,
    onCommandSelection,
}: CommandSelectionAreaProps): JSX.Element => (
    <div data-testid="command-selection-area">
        <h1>Commands</h1>
        {actions.map((action) =>
            CommandButton({
                commandFormAndLabels: action,
                onButtonClick: onCommandSelection,
            })
        )}
    </div>
);
