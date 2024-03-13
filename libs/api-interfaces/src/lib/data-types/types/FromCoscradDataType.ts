import { CoscradDataType } from '../coscrad-data-type.enum';

// We should find a way to force this list to be comprehensive
type CoscradDataTypeToTypeScriptType = {
    [CoscradDataType.CompositeIdentifier]: {
        id: string;
        type: string;
    };
    [CoscradDataType.Boolean]: boolean;
    [CoscradDataType.CompositeIdentifier]: { type: string; id: string };
    [CoscradDataType.ISBN]: string;
    [CoscradDataType.NonEmptyString]: string;
    [CoscradDataType.NonNegativeFiniteNumber]: number;
    [CoscradDataType.PositiveInteger]: number;
    [CoscradDataType.RawData]: Record<string, unknown>;
    [CoscradDataType.URL]: string;
    [CoscradDataType.UUID]: string;
    [CoscradDataType.Month]: number;
    [CoscradDataType.Year]: number;
    [CoscradDataType.String]: string;
    [CoscradDataType.FixedValue]: unknown;
    [CoscradDataType.FiniteNumber]: number;
    [CoscradDataType.PageNumber]: string;
};

// is this still used? Well is it?
export type FromCoscradDataType<T extends CoscradDataType> = CoscradDataTypeToTypeScriptType[T];
