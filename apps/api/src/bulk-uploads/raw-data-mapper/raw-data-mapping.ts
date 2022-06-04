/**
 * The client must specify how to calculate the value of each field from
 * the entire input object (raw data).
 */
export type FieldCalculationRules<
    TInput extends Record<string, unknown>,
    UTarget extends Record<string, unknown>
> = {
    [K in keyof UTarget]: (input: TInput) => UTarget[K];
};

export class RawDataMapping<
    TInput extends Record<string, unknown>,
    UTarget extends Record<string, unknown>
> {
    constructor(private readonly fieldCalculators: FieldCalculationRules<TInput, UTarget>) {}

    public apply(rawData: TInput): UTarget {
        return Object.entries(this.fieldCalculators).reduce(
            (accumulatedOutput: Partial<UTarget>, [key, calculateValue]) => ({
                ...accumulatedOutput,
                [key]: calculateValue(rawData),
            }),
            {}
        ) as UTarget;
    }
}
