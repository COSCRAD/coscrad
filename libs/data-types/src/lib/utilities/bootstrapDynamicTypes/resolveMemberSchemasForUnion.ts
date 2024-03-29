import { UnionMemberMetadata } from '../../decorators';
import { ClassSchema, isSimpleCoscradPropertyTypeDefinition } from '../../types';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { buildUnionTypesMap } from './buildUnionTypesMap';
import { UnionLeveragesAnotherException } from './exceptions';
import { leveragesUniontype } from './leveragesUnionType';

export type UnionMemberSchemaDefinition = Pick<UnionMemberMetadata, 'discriminant'> & {
    schema: ClassSchema;
};

export const resolveMemberSchemasForUnion = (
    allCtorCandidates: unknown[],
    unionName: string
): UnionMemberSchemaDefinition[] => {
    // @ts-expect-error fix types
    const unionMap = buildUnionTypesMap(allCtorCandidates);

    const { membersMap } = unionMap.get(unionName);

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

                    throw new UnionLeveragesAnotherException(unionName);
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
            discriminant: discriminantValue,
            schema: updatedSchema,
        };
    });
};
