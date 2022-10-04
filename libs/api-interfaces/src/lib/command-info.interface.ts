export interface ICommandInfo {
    // TODO Extend CommandMetadataBase from commands lib
    type: string;
    label: string;
    description: string;
    schema: Record<string, unknown>;
}
