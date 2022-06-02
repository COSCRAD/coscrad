export interface FluxStandardAction<T extends Record<string, unknown> = any> {
    type: string;
    payload: T;
}
