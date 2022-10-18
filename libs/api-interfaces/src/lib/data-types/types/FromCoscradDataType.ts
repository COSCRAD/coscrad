import { CoscradDataType } from '../coscrad-data-type.enum';

// We should find a way to force this list to be comprehensive
type CoscradDataTypeToTypeScriptType = {
    [CoscradDataType.CompositeIdentifier]: {
        id: string;
        type: string;
    };
    [CoscradDataType.ISBN]: string;
    [CoscradDataType.NonEmptyString]: string;
    [CoscradDataType.NonNegativeFiniteNumber]: number;
    [CoscradDataType.PositiveInteger]: number;
    [CoscradDataType.RawData]: Record<string, unknown>;
    [CoscradDataType.URL]: string;
    [CoscradDataType.UUID]: string;
    [CoscradDataType.Year]: number;
};

export type FromCoscradDataType<T extends CoscradDataType> = CoscradDataTypeToTypeScriptType[T];
