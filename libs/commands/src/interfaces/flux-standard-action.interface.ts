export interface FluxStandardAction<T extends Record<string, unknown> = {}> {
    type: string;
    payload: T;
}
