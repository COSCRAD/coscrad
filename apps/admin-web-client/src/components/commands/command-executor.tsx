import {
    AggregateType,
    ICommandFormAndLabels as IBackendCommandFormAndLabels,
} from '@coscrad/api-interfaces';
import { Stack, Typography } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { executeCommand } from '../../store/slices/command-status';
import { useLoadableGeneratedId } from '../../store/slices/id-generation';
import { DynamicForm } from '../dynamic-forms/dynamic-form';
import { ErrorDisplay } from '../error-display/error-display';
import { Loading } from '../loading';

export interface CommandExecutorProps {
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
}

export interface CommandExecutor {
    (props: CommandExecutorProps): JSX.Element;
}

export interface CommandExecutionFormProps {
    onSubmitForm: (fsa: { type: string; payload: Record<string, unknown> }) => void;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
    bindProps: Record<string, unknown>;
}

export interface CommandExecutionForm {
    (props: CommandExecutionFormProps): JSX.Element;
}

export type DynamicCommandFormProps = Omit<CommandExecutionFormProps, 'onSubmitForm'> & {
    commandType: string;
    bindProps: Record<string, unknown>;
    onSubmitForm: (fsa: { type: string; payload: Record<string, unknown> }) => void;
};

export const buildDynamicCommandForm =
    ({ form: { fields }, type: commandType, label }: IBackendCommandFormAndLabels) =>
    ({ onSubmitForm, onFieldUpdate, formState, bindProps }: DynamicCommandFormProps) =>
        (
            <Stack>
                {/* TODO Include the tooltip with appropriate positioning */}
                {/* <Tooltip title={description}> */}
                <Typography variant="h3">{label}</Typography>
                {/* </Tooltip> */}
                <DynamicForm
                    bindProps={bindProps}
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
            </Stack>
        );

export const buildCommandExecutor =
    (
        CommandForm: CommandExecutionForm,
        bindProps: Record<string, unknown>,
        generateIdForAggregateOfType?: AggregateType
    ): CommandExecutor =>
    ({ onFieldUpdate, formState }: DynamicCommandFormProps) => {
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
                          ...bindProps,
                          aggregateCompositeIdentifier: {
                              type: generateIdForAggregateOfType,
                              id: loadableGeneratedId.data,
                          },
                      },
                  }
                : { ...commandFsa, ...bindProps };

            dispatch(executeCommand(fullFsa));
        };

        return (
            <>
                <h1>Execute Command</h1>
                <CommandForm
                    formState={formState}
                    onFieldUpdate={onFieldUpdate}
                    bindProps={bindProps}
                    onSubmitForm={onSubmitForm}
                />
            </>
        );
    };
