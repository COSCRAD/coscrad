import {
    AggregateCompositeIdentifier,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { useAppDispatch } from '../../app/hooks';
import { executeCommand } from '../../store/slices/command-status';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { CommandExecutor } from './dyanmic-command-executor';

interface CommandExecutionFormProps {
    onSubmitForm: () => void;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    generate?: {
        id: {
            path: string;
        };
    };
}

export interface CommandExecutionForm {
    (props: CommandExecutionFormProps): JSX.Element;
}

export type CommandExecutorProps = Omit<CommandExecutionFormProps, 'onSubmitForm'> & {
    commandType: string;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
};

export const buildDynamicCommandForm =
    ({ form: { fields } }: IBackendCommandFormAndLabels) =>
    ({ onSubmitForm, onFieldUpdate, formState }) =>
        (
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
        );

export const buildCommandExecutor =
    (CommandForm: CommandExecutionForm): CommandExecutor =>
    ({
        onFieldUpdate,
        formState,
        aggregateCompositeIdentifier,
        commandType,
    }: CommandExecutorProps) => {
        const dispatch = useAppDispatch();

        // TODO handle ID generation here

        const onSubmitForm = () => {
            const commandFsa = {
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier,
                    ...formState,
                },
            };

            dispatch(executeCommand(commandFsa));
        };

        return (
            <>
                <h1>Execute Command</h1>

                {/* TODO Put this on the Command Form? */}
                {/* <div>
                    <h3>{label}</h3>
                    <br />
                    <p>{description}</p>
                    <br />
                </div> */}
                <CommandForm
                    formState={formState}
                    onFieldUpdate={onFieldUpdate}
                    aggregateCompositeIdentifier={aggregateCompositeIdentifier}
                    onSubmitForm={onSubmitForm}
                />
            </>
        );
    };
