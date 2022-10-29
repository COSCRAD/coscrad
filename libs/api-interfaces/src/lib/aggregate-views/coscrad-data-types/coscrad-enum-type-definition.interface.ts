// TODO break out and share across codebase
type LabelAndValue = {
    label: string;
    value: string;
};

export interface ICoscradEnumTypeDefinition {
    complexDataType: 'ENUM';
    enumName: string;
    labelsAndValues: LabelAndValue[];
}
