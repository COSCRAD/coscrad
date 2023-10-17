export interface ISimpleCoscradPropertyTypeDefinition<TDataTypeEnum extends string = string> {
    coscradDataType: TDataTypeEnum;
    isArray: boolean;
    isOptional: boolean;
    label: string;
    description: string;
    /**
     * If this is defined, this property is a reference (by ID) to
     * an aggregate of the given type. This can be used to determine
     * required joins in repositories or views, or to populate
     * dynamic selection options for command forms, for example.
     */
    referenceTo?: string;
    /**
     * If specified, the client should bind the value of the given property
     * from its own view state when building an object that satisfies the
     * given schema. This typically happens when populating command forms and
     * using the view (in an abastract sense) as a form element to populate
     * some of the payload.
     */
    bindToViewProperty?: string;
}
