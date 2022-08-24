import { AggregateFactoryInalidTestCase } from '..';
import { FuzzGenerator, getCoscradDataSchema } from '../../../../../../../../libs/data-types/src';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { DTO } from '../../../../../types/DTO';
import buildInvariantValidationErrorFactoryFunction from '../../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/buildInvariantValidationErrorFactoryFunction';
import { Aggregate } from '../../../../models/aggregate.entity';
import createInvalidAggregateFactory from '../../../../models/__tests__/utilities/createInvalidAggregateFactory';
import { AggregateType, AggregateTypeToAggregateInstance } from '../../../../types/AggregateType';
import { aggregateTypeToAggregateCtor } from '../../../utilities/getAggregateCtorFromAggregateType';

export const generateFuzzAggregateFactoryTestCases = <
    TAggregateType extends AggregateType = AggregateType
>(
    aggregateType: TAggregateType,
    validDTO: DTO<AggregateTypeToAggregateInstance[TAggregateType]>
): AggregateFactoryInalidTestCase[] =>
    Object.entries(
        getCoscradDataSchema(aggregateTypeToAggregateCtor[aggregateType as AggregateType])
    )
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
