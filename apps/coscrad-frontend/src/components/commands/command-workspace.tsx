import { AggregateCompositeIdentifier } from '@coscrad/api-interfaces';
import { Ack, useLoadableCommandResult } from '../../store/slices/command-status';
import { Loading } from '../loading';
import { AckNotification } from './ack-notification';
import { ICommandExecutorAndLabels } from './command-panel';
import { NackNotification } from './nack-notification';

interface CommandWorkspaceProps {
    ExecutorAndLabelsForSelectedCommand: ICommandExecutorAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    onAcknowledgeCommandResult: (didCommandSucceed: boolean) => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}

export const CommandWorkspace = (props: CommandWorkspaceProps): JSX.Element => {
    const {
        onAcknowledgeCommandResult,
        ExecutorAndLabelsForSelectedCommand: { executor: CommandExecutor, type: commandType },
    } = props;

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

    /**
     * We may want to return to the form and maintain the form state in case
     * of error acknowledgement so that the user can attempt to fix their
     * user errors.
     */
    if (commandResult === Ack)
        return <AckNotification _onClick={() => onAcknowledgeCommandResult(true)} />;

    // return <CommandExecutor {...props} commandType={commandType} />;
    return <CommandExecutor {...props} />;
};
