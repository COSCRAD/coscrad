/**
 * TODO Do we want to expose data internals or just
 * methods here?
 */
export interface ICoscradEvent<TPayload = unknown> {
    type: string;

    isOfType(type: string): boolean;

    isFor(compositeIdentifier: { type: string; id: string }): boolean;

    payload: TPayload;
}
