import { ICommandExecutorAndLabels } from './command-panel';

interface CommandWorkspaceProps {
    executorAndLabelsForSelectedCommand: ICommandExecutorAndLabels;
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
}

// TODO Remove this component unless reverting to the previous (longer) implementation
export const CommandWorkspace = (props: CommandWorkspaceProps): JSX.Element => {
    const {
        executorAndLabelsForSelectedCommand: { executor: CommandExecutor },
    } = props;

    return <CommandExecutor {...props} />;
};
