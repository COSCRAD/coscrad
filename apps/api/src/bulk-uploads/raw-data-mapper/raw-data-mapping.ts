/**
 * The client must specify how to calculate the value of each field from
 * the entire input object (raw data).
 */
export type FieldCalculationRules<
    TInput extends Record<string, unknown>,
    UTarget extends Record<string, unknown>
> = (input: TInput) => UTarget;

export class RawDataMapping<
    TInput extends Record<string, unknown>,
    UTarget extends Record<string, unknown>
> {
    constructor(private readonly fieldCalculators: FieldCalculationRules<TInput, UTarget>) {}

    public apply(rawData: TInput): UTarget {
        return this.fieldCalculators(rawData);
    }
}
