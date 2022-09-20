export enum EdgeConnectionMemberRole {
    to = 'to',
    from = 'from',
    self = 'self',
}

export const isEdgeConnectionMemberRole = (input: unknown): input is EdgeConnectionMemberRole =>
    Object.values(EdgeConnectionMemberRole).includes(input as EdgeConnectionMemberRole);
