import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { COSCRAD_DATA_TYPE_METADATA } from '../../constants';
import { CoscradPropertyTypeDefinition, isSimpleCoscradPropertyTypeDefinition } from '../../types';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { leveragesUniontype } from './leveragesUnionType';
import { resolveMemberSchemasForUnion } from './resolveMemberSchemasForUnion';

const mixUnionMemberSchemasIntoTypeDefinitionForClass = (
    allCtorCandidates: unknown[],
    dataSchema: ReturnType<typeof getCoscradDataSchema>
): CoscradPropertyTypeDefinition => {
    const updatedSchema = Object.entries(dataSchema).reduce(
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

                return {
                    ...acc,
                    [propertyKey]: {
                        ...propertyTypeDefinition,
                        schema: mixUnionMemberSchemasIntoTypeDefinitionForClass(
                            allCtorCandidates,
                            // @ts-expect-error fix me
                            nestedSchema
                        ),
                    },
                };
            }

            if (complexDataType === 'UNION_TYPE') {
                const { unionName } = propertyTypeDefinition;

                return {
                    ...acc,
                    [propertyKey]: {
                        ...propertyTypeDefinition,
                        schemaDefinitions: resolveMemberSchemasForUnion(
                            allCtorCandidates,
                            unionName
                        ),
                    },
                };
            }
        },
        {}
    );

    return updatedSchema as CoscradPropertyTypeDefinition;
};

/**
 * When leveraging union types it is important that every class has been registered
 * first. Because we want to avoid shared references to these classes to minimize
 * coupling and circular dependencies, we piece the union member schemas back together
 * at bootstrap. You must call `bootstrapDynamictypes` once at bootstrap, passing
 * in an array of class ctor references for your data classes. In NestJS, we do
 * this by walking the IoC containers but we do not assume anything about
 * the client's dependency injection framework in this lib.
 */
export const bootstrapDynamicTypes = (allCtorCandidates: unknown[]) => {
    // Limit ourselves to classes that have COSCRAD data type decorators
    const ctorsWithTypeDefinitions = allCtorCandidates.filter(
        (input) => !isNullOrUndefined(getCoscradDataSchema(input))
    );

    // Limit metadata updates to classes whose COSCRAD data schemas leverage a union at some depth
    const ctorsThatLeverageAUnionType = ctorsWithTypeDefinitions.filter((ctor) =>
        leveragesUniontype(getCoscradDataSchema(ctor))
    );

    /**
     * Now we iterate through all classes leveraging COSCRAD unions,
     * writing the schemas for each union property.
     */
    ctorsThatLeverageAUnionType.forEach((ctor) => {
        const updatedSchema = mixUnionMemberSchemasIntoTypeDefinitionForClass(
            allCtorCandidates,
            getCoscradDataSchema(ctor)
        );

        // @ts-expect-error fix types
        Reflect.defineMetadata(COSCRAD_DATA_TYPE_METADATA, updatedSchema, ctor.prototype);
    });
};
