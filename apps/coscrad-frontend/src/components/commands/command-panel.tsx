import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
    Ack,
    clearCommandStatus,
    useLoadableCommandResult,
} from '../../store/slices/command-status';
import { idUsed } from '../../store/slices/id-generation';
import { useFormState } from '../dynamic-forms/form-state';
import { CommandExecutor } from './command-executor';
import { CommandSelectionArea } from './command-selection-area';
import { CommandWorkspace } from './command-workspace';

export const INDEX_COMMAND_CONTEXT = 'index';

export type CommandContext = AggregateType | AggregateCompositeIdentifier;

export type ICommandExecutorAndLabels = Omit<IBackendCommandFormAndLabels, 'form'> & {
    executor: CommandExecutor;
};

interface CommandPanelProps {
    actions: ICommandExecutorAndLabels[];
}

export const CommandPanel = ({ actions }: CommandPanelProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm, clearForm] = useFormState();

    const dispatch = useAppDispatch();

    const { data: commandResult } = useLoadableCommandResult();

    // Do not render if there are no available actions
    if (actions.length === 0) return null;

    const selectedCommand = actions.find((action) => action.type === selectedCommandType);

    /**
     * TODO Clean this up.
     *
     * This is a hack. There is some state change that is causing us to land
     * back here before the user has accepted the acknowledgement of a successful
     * command.
     */
    if (isNull(selectedCommandType) && commandResult !== Ack)
        return (
            <CommandSelectionArea
                metaForCommands={actions}
                onCommandSelection={(type: string) => setSelectedCommandType(type)}
            />
        );

    return (
        <CommandWorkspace
            executorAndLabelsForSelectedCommand={selectedCommand}
            onFieldUpdate={updateForm}
            formState={formState}
            onAcknowledgeCommandResult={(didCommandSucceed: boolean) => {
                setSelectedCommandType(null);
                dispatch(clearCommandStatus());
                clearForm();
                if (didCommandSucceed) dispatch(idUsed());
            }}
        />
    );
};
