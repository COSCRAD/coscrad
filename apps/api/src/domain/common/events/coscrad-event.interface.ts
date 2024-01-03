export interface ICoscradEvent<TPayload = unknown> {
    isOfType(type: string): boolean;
    isFor(compositeIdentifier: { type: string; id: string }): boolean;
    getPayload(): TPayload;
}
