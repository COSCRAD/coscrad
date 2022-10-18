export interface FluxStandardAction<TPayload, UTypeUnion extends string = string> {
    type: UTypeUnion;
    payload: TPayload;
}
