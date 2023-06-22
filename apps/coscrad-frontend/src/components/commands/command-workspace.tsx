import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { Ack, useLoadableCommandResult } from '../../store/slices/command-status';
import { Loading } from '../loading';
import { AckNotification } from './ack-notification';
import { ICommandExecutionFormAndLabels } from './command-panel';
import { NackNotification } from './nack-notification';

interface CommandWorkspaceProps {
    SelectedForm: ICommandExecutionFormAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    onAcknowledgeCommandResult: (didCommandSucceed: boolean) => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}

export const CommandWorkspace = (props: CommandWorkspaceProps): JSX.Element => {
    const {
        onAcknowledgeCommandResult,
        SelectedForm: { form: CommandForm, type: commandType },
    } = props;

    // TODO move this logic here
    // const dispatch = useAppDispatch();

    // const { label, description, form, type: commandType } = commandFormAndLabels;

    // const { fields } = form;

    // const onSubmitForm = () => {
    //     const commandFsa = {
    //         type: commandType,
    //         payload: {
    //             aggregateCompositeIdentifier,
    //             ...formState,
    //         },
    //     };

    //     dispatch(executeCommand(commandFsa));
    // };

    const { isLoading, errorInfo, data: commandResult } = useLoadableCommandResult();

    // TODO Use `displayLoadable` helper here
    if (isLoading) return <Loading />;

    if (errorInfo !== null)
        return (
            <NackNotification
                _onClick={() => onAcknowledgeCommandResult(false)}
                errorInfo={errorInfo}
            />
        );

    if (commandResult === Ack)
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;

    // @ts-expect-error not clear why this doesn't work
    return <CommandForm {...props} commandType={commandType} />;
};
