import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels,
    isAggregateType,
} from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { useState } from 'react';
import { useAppDispatch } from '../../app/hooks';
import { clearCommandStatus } from '../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../store/slices/id-generation';
import { useFormState } from '../dynamic-forms/form-state';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';
import { CommandButton } from './command-button';
import { CommandWorkspace } from './command-workspace';

export const INDEX_COMMAND_CONTEXT = 'index';

export type CommandContext = AggregateType | AggregateCompositeIdentifier;

interface CommandPanelProps {
    actions: ICommandFormAndLabels[];
    commandContext: CommandContext;
}

export const CommandPanel = ({ actions, commandContext }: CommandPanelProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm] = useFormState();

    const dispatch = useAppDispatch();

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

    if (isNull(selectedCommandType))
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
        <CommandWorkspace
            selectedCommand={selectedCommand}
            onFieldUpdate={updateForm}
            formState={formState}
            aggregateCompositeIdentifier={
                isAggregateType(commandContext)
                    ? { type: commandContext, id: generatedId }
                    : commandContext
            }
            onAcknowledgeCommandResult={() => {
                setSelectedCommandType(null);
                dispatch(clearCommandStatus());
            }}
        />
    );
};
