export interface ISimpleCoscradPropertyTypeDefinition<TDataTypeEnum extends string = string> {
    coscradDataType: TDataTypeEnum;
    isArray: boolean;
    isOptional: boolean;
}
