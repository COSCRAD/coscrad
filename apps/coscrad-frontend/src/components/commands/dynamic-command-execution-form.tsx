import {
    AggregateCompositeIdentifier,
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { useAppDispatch } from '../../app/hooks';
import { executeCommand } from '../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../store/slices/id-generation';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';
import { CommandExecutor } from './dyanmic-command-executor';

interface CommandExecutionFormProps {
    onSubmitForm: (fsa: { type: string; payload: Record<string, unknown> }) => void;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
    // TODO Is this used?
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
    onSubmitForm: (fsa: { type: string; payload: Record<string, unknown> }) => void;
};

export const buildDynamicCommandForm =
    ({ form: { fields }, type: commandType }: IBackendCommandFormAndLabels) =>
    ({
        onSubmitForm,
        onFieldUpdate,
        formState,
        /**
         * TODO We should sort out bind props vs. generate and use the same
         * approach as the hard-wired `create-note` for this. We are moving towards
         * this information coming from the back-end so we can remove this
         * complexity.
         *
         **/
        aggregateCompositeIdentifier,
    }: CommandExecutorProps) =>
        (
            <DynamicForm
                bindProps={{ aggregateCompositeIdentifier }}
                commandType={commandType}
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
    (
        CommandForm: CommandExecutionForm,
        generateIdForAggregateOfType?: AggregateType
    ): CommandExecutor =>
    ({ onFieldUpdate, formState, aggregateCompositeIdentifier }: CommandExecutorProps) => {
        const dispatch = useAppDispatch();

        const loadableGeneratedId = generateIdForAggregateOfType ? useLoadableGeneratedId() : null;

        if (loadableGeneratedId) {
            const { errorInfo, isLoading } = loadableGeneratedId;

            if (isLoading) return <Loading />;

            if (errorInfo) return <ErrorDisplay {...errorInfo} />;
        }

        const onSubmitForm = (commandFsa) => {
            const fullFsa = generateIdForAggregateOfType
                ? {
                      ...commandFsa,
                      payload: {
                          ...commandFsa.payload,
                          aggregateCompositeIdentifier: {
                              type: generateIdForAggregateOfType,
                              id: loadableGeneratedId.data,
                          },
                      },
                  }
                : commandFsa;

            dispatch(executeCommand(fullFsa));
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
