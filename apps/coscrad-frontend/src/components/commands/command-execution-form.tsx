import { AggregateCompositeIdentifier, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { useAppDispatch } from '../../app/hooks';
import { executeCommand } from '../../store/slices/command-status';
import { DynamicForm } from '../dynamic-forms/dynamic-form';

interface CommandExecutionFormProps {
    selectedCommand: ICommandFormAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}

export const CommandExecutionForm = ({
    selectedCommand,
    onFieldUpdate,
    formState,
    aggregateCompositeIdentifier,
}: CommandExecutionFormProps): JSX.Element => {
    const dispatch = useAppDispatch();

    const { label, description, form } = selectedCommand;

    const { fields } = form;

    const onSubmitForm = () => {
        const commandFsa = {
            type: selectedCommand.type,
            payload: {
                aggregateCompositeIdentifier,
                ...formState,
            },
        };

        console.log({
            submittedCommandWithFSA: commandFsa,
        });

        dispatch(executeCommand(commandFsa));
    };

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
                    onSubmitForm={onSubmitForm}
                    onFieldUpdate={onFieldUpdate}
                    formState={formState}
                />
            </div>
        </>
    );
};
