import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels,
    isAggregateType,
} from '@coscrad/api-interfaces';
import { useState } from 'react';
import { useLoadableGeneratedId } from '../../store/slices/id-generation';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { useFormState } from '../dynamic-forms/form-state';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../Loading';
import { CommandButton } from './command-button';

export const INDEX_COMMAND_CONTEXT = 'index';

export type CommandContext = AggregateType | AggregateCompositeIdentifier;

interface CommandPanelProps {
    actions: ICommandFormAndLabels[];
    commandContext: CommandContext;
}

export const CommandPanel = ({ actions, commandContext }: CommandPanelProps) => {
    const [selectedCommandType, setSelectedCommandType] = useState<string>(null);

    const [formState, updateForm] = useFormState();

    const { isLoading, errorInfo, data: generatedId } = useLoadableGeneratedId();

    // Do not render if there are no available actions
    if (actions.length === 0) return null;

    /**
     * TODO [https://www.pivotaltracker.com/story/show/184107132]
     * Use `displayLoadable` helper here
     */
    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || generatedId === null) return <Loading />;

    const selectedCommand = actions.find((action) => action.type === selectedCommandType);

    if (selectedCommandType === null)
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

    const {
        label,
        description,
        form: { fields },
    } = selectedCommand;

    return (
        <>
            <h1>Execute Command</h1>
            <div>
                <h3>{label}</h3>
                <br />
                <p>{description}</p>
                <br />
                <DynamicForm
                    fields={fields}
                    /**
                     * TODO [https://www.pivotaltracker.com/story/show/184056544]
                     * In reality, things are a bit more complex than this. We
                     * will eventually need to display an `Ack` \ `NAck` and then
                     * an `ok` button via either this panel or a modal.
                     */
                    onSubmitForm={() => {
                        const commandFsa = {
                            type: selectedCommand.type,
                            payload: {
                                aggregateCompositeIdentifier: isAggregateType(commandContext)
                                    ? { type: commandContext, id: generatedId }
                                    : commandContext,
                                ...formState,
                            },
                        };

                        console.log({
                            submittedCommandWithFSA: commandFsa,
                        });

                        setSelectedCommandType(null);
                    }}
                    onFieldUpdate={updateForm}
                    formState={formState}
                />
            </div>
        </>
    );
};
