import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
    isAggregateType,
} from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import {
    Ack,
    clearCommandStatus,
    useLoadableCommandResult,
} from '../../store/slices/command-status';
import { idUsed, useLoadableGeneratedId } from '../../store/slices/id-generation';
import { useFormState } from '../dynamic-forms/form-state';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';
import { CommandSelectionArea } from './command-selection-area';
import { CommandWorkspace } from './command-workspace';
import { CommandExecutor } from './dyanmic-command-executor';

export const INDEX_COMMAND_CONTEXT = 'index';

export type CommandContext = AggregateType | AggregateCompositeIdentifier;

export type ICommandExecutionFormAndLabels = Omit<IBackendCommandFormAndLabels, 'form'> & {
    form: CommandExecutor;
};

interface CommandPanelProps {
    actions: ICommandExecutionFormAndLabels[];
    commandContext: CommandContext;
}

export const CommandPanel = ({ actions, commandContext }: CommandPanelProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm, clearForm] = useFormState();

    const dispatch = useAppDispatch();

    const { data: commandResult } = useLoadableCommandResult();

    const { isLoading, errorInfo, data: generatedId } = useLoadableGeneratedId();

    // Do not render if there are no available actions
    if (actions.length === 0) return null;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184107132]
     * Use `displayLoadable` helper here
     */
    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || isNull(generatedId)) return <Loading />;

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
                actions={actions}
                onCommandSelection={(type: string) => setSelectedCommandType(type)}
            />
        );

    return (
        <CommandWorkspace
            SelectedForm={selectedCommand}
            onFieldUpdate={updateForm}
            formState={formState}
            aggregateCompositeIdentifier={
                isAggregateType(commandContext)
                    ? { type: commandContext, id: generatedId }
                    : commandContext
            }
            onAcknowledgeCommandResult={(didCommandSucceed: boolean) => {
                setSelectedCommandType(null);
                dispatch(clearCommandStatus());
                clearForm();
                if (didCommandSucceed) dispatch(idUsed());
            }}
        />
    );
};
