import { CoscradComplexDataType } from './coscrad-complex-data-type.enum';

// TODO break out and share across codebase
type LabelAndValue = {
    label: string;
    value: string;
};

export interface ICoscradEnumTypeDefinition {
    complexDataType: CoscradComplexDataType.enum;
    enumName: string;
    labelsAndValues: LabelAndValue[];
}
