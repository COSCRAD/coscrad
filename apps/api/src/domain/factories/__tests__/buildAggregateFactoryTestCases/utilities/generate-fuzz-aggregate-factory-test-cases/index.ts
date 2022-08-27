import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { AggregateFactoryInalidTestCase } from '../..';
import { isDiscriminatedUnionResourceType } from '../../../../../../domain/factories/utilities/isDiscriminatedUnionResourceType';
import { InternalError, isInternalError } from '../../../../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../../../../lib/types/DomainModelCtor';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../../../../types/DTO';
import { Aggregate } from '../../../../../models/aggregate.entity';
import createInvalidAggregateFactory from '../../../../../models/__tests__/utilities/createInvalidAggregateFactory';
import {
    AggregateType,
    AggregateTypeToAggregateInstance,
} from '../../../../../types/AggregateType';
import buildInvariantValidationErrorFactoryFunction from '../../../../../__tests__/utilities/buildInvariantValidationErrorFactoryFunction';
import getInstanceFactoryForResource from '../../../../getInstanceFactoryForResource';
import getAggregateCtorFromAggregateType from '../../../../utilities/getAggregateCtorFromAggregateType';

const getCtor = <TAggregateType extends AggregateType = AggregateType>(
    aggregateType: TAggregateType,
    validDTO: DTO<AggregateTypeToAggregateInstance[TAggregateType]>
): DomainModelCtor<AggregateTypeToAggregateInstance[TAggregateType]> => {
    if (isDiscriminatedUnionResourceType(aggregateType)) {
        const result = getInstanceFactoryForResource(aggregateType)(validDTO);

        if (isInternalError(result))
            throw new InternalError(`Failed to build an instance of: ${aggregateType}`);

        /**
         * TODO [hack] find a better way to get the Ctor from the subtype for a
         * discriminated union resource
         */
        return Object.getPrototypeOf(result).constructor;
    }

    return getAggregateCtorFromAggregateType(aggregateType);
};

export const generateFuzzAggregateFactoryTestCases = <
    TAggregateType extends AggregateType = AggregateType
>(
    aggregateType: TAggregateType,
    validDTO: DTO<AggregateTypeToAggregateInstance[TAggregateType]>
): AggregateFactoryInalidTestCase[] =>
    Object.entries(getCoscradDataSchema(getCtor(aggregateType, validDTO)))
        .filter(([propertyName, _]) => propertyName !== 'id')
        .flatMap(([propertyName, propertySchema]) =>
            new FuzzGenerator(propertySchema)
                .generateInvalidValues()
                .map(({ value, description }) => ({
                    description: `When ${propertyName} has an invalid value: ${JSON.stringify(
                        value
                    )} (${description})`,
                    dto: createInvalidAggregateFactory(validDTO as DTO<Aggregate>)({
                        [propertyName]: value,
                    }),
                    checkError: (result: unknown) => {
                        assertErrorAsExpected(
                            result,
                            buildInvariantValidationErrorFactoryFunction(aggregateType)(
                                (validDTO as DTO<Aggregate>).id,
                                []
                            )
                        );
                    },
                }))
        );
