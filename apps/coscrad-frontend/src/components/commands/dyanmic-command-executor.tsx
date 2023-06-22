export interface CommandExecutorProps {
    onFieldUpdate: (propertyKey: string, value: unknown) => void;
    formState: Record<string, unknown>;
}

export interface CommandExecutor {
    (props: CommandExecutorProps): JSX.Element;
}
