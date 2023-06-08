import { ClassSchema, isSimpleCoscradPropertyTypeDefinition } from '../../types';

export const leveragesUniontype = (coscradClassSchema: ClassSchema): boolean => {
    return Object.entries(coscradClassSchema).some(([_propertyKey, propertyTypeDefinition]) => {
        if (isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition)) return false;

        const { complexDataType } = propertyTypeDefinition;

        if (complexDataType === 'NESTED_TYPE') {
            const { schema } = propertyTypeDefinition;

            return leveragesUniontype(schema as ClassSchema);
        }

        if (complexDataType === 'UNION_TYPE') {
            return true;
        }

        return false;
    });
};
