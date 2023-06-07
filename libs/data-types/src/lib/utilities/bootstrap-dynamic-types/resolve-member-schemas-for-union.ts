import { UnionMemberMetadata } from '../../decorators';
import { ClassSchema, isSimpleCoscradPropertyTypeDefinition } from '../../types';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { buildUnionTypesMap } from './bootstrap-dynamic-types';
import { leveragesUniontype } from './leverages-union-type';

export type UnionMemberSchemaDefinition = Pick<UnionMemberMetadata, 'discriminantValue'> & {
    schema: ClassSchema;
};

export const resolveMemberSchemasForUnion = (
    allCtorCandidates: unknown[],
    unionName: string
): UnionMemberSchemaDefinition[] => {
    const unionMap = buildUnionTypesMap(allCtorCandidates);

    const membersMap = unionMap.get(unionName);

    if (!membersMap) {
        return [];
    }

    return Array.from(membersMap.keys()).map((discriminantValue) => {
        const ctor = membersMap.get(discriminantValue);

        const rawSchema = getCoscradDataSchema(ctor);

        const updatedSchema = Object.entries(rawSchema).reduce(
            (acc, [propertyKey, propertyTypeDefinition]) => {
                if (
                    isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition) ||
                    !['NESTED_TYPE', 'UNION_TYPE'].includes(propertyTypeDefinition.complexDataType)
                )
                    return {
                        ...acc,
                        [propertyKey]: propertyTypeDefinition,
                    };

                const { complexDataType } = propertyTypeDefinition;

                if (complexDataType === 'NESTED_TYPE') {
                    const { schema: nestedSchema } = propertyTypeDefinition;

                    // @ts-expect-error fix types
                    if (!leveragesUniontype(nestedSchema))
                        return {
                            ...acc,
                            [propertyKey]: propertyTypeDefinition,
                        };

                    throw new Error(
                        `not implemented: cannot resolve union type: ${unionName} as one of its members leverages another union`
                    );
                }

                if (complexDataType === 'UNION_TYPE')
                    return {
                        ...acc,
                        [propertyKey]: {
                            ...propertyTypeDefinition,
                            schemaDefinitions: resolveMemberSchemasForUnion(
                                allCtorCandidates,
                                propertyTypeDefinition.unionName
                            ),
                        },
                    };
            },
            {}
        );

        return {
            discriminantValue,
            schema: updatedSchema,
        };
    });
};
