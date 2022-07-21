export enum EdgeConnectionContextType {
    general = 'general',
    pageRange = 'pageRange',
    timeRange = 'timeRange',
    textField = 'textField',
    point2D = 'point2D',
    freeMultiline = 'freeMultiline',
}

export const isEdgeConnectionContextType = (input: unknown): input is EdgeConnectionContextType =>
    Object.values(EdgeConnectionContextType).includes(input as EdgeConnectionContextType);
