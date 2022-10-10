export enum ComplexCoscradDataType {
    enum = 'ENUM',
    nested = 'NESTED_TYPE',
    union = 'UNION_TYPE',
}

export const isComplexCoscradDataType = (input: unknown): input is ComplexCoscradDataType =>
    Object.values(ComplexCoscradDataType).includes(input as ComplexCoscradDataType);
