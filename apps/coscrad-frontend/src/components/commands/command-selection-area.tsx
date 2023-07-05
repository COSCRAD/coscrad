import { ICommandMeta } from '@coscrad/api-interfaces';
import { CommandButton } from './command-button';

interface CommandSelectionAreaProps {
    metaForCommands: ICommandMeta[];
    onCommandSelection: (type: string) => void;
}

export const CommandSelectionArea = ({
    metaForCommands,
    onCommandSelection,
}: CommandSelectionAreaProps): JSX.Element => (
    <div data-testid="command-selection-area">
        {metaForCommands.map((commandMeta) => (
            <CommandButton commandMeta={commandMeta} onButtonClick={onCommandSelection} />
        ))}
    </div>
);
