import { AggregateCompositeIdentifier, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { Ack, useLoadableCommandResult } from '../../store/slices/command-status';
import { Loading } from '../Loading';
import { AckNotification } from './ack-notification';
import { CommandExecutionForm } from './command-execution-form';
import { NackNotification } from './nack-notification';

interface CommandWorkspaceProps {
    selectedCommand: ICommandFormAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    onAcknowledgeCommandResult: () => void;
    formState: Record<string, unknown>;
    aggregateCompositeIdentifier: AggregateCompositeIdentifier;
}

export const CommandWorkspace = (props: CommandWorkspaceProps): JSX.Element => {
    const { onAcknowledgeCommandResult } = props;

    const { isLoading, errorInfo, data: commandResult } = useLoadableCommandResult();

    if (isLoading) return <Loading />;

    if (errorInfo !== null)
        return <NackNotification _onClick={onAcknowledgeCommandResult} errorInfo={errorInfo} />;

    if (commandResult === Ack) return <AckNotification _onClick={onAcknowledgeCommandResult} />;

    return <CommandExecutionForm {...props} />;
};
