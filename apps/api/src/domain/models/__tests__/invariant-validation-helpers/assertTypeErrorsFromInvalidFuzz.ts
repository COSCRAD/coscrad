import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Ctor } from '../../../../lib/types/Ctor';
import { DTO } from '../../../../types/DTO';
import { Aggregate } from '../../aggregate.entity';
import createInvalidAggregateFactory from '../utilities/createInvalidAggregateFactory';
import assertCoscradDataTypeAndTopLevelError from './assertCoscradDataTypeAndTopLevelError';

export default <TAggregate extends Aggregate>(
    AggregateCtor: Ctor<TAggregate>,
    validDto: DTO<TAggregate>,
    TopLevelErrorCtor: Ctor<InternalError>
): void => {
    const userGroupDataSchema = getCoscradDataSchema(AggregateCtor);

    const buildInvalidDto = createInvalidAggregateFactory(new AggregateCtor(validDto));

    Object.entries(userGroupDataSchema).forEach(([propertyName, propertySchema]) => {
        describe(`when the property: ${propertyName} is invalid`, () => {
            const invalidValuesToUse = new FuzzGenerator(propertySchema).generateInvalidValues();

            invalidValuesToUse.forEach(({ value, description }): void => {
                describe(`when given the invalid value: ${JSON.stringify(
                    value
                )} (${description})`, () => {
                    it('should return the expected error', () => {
                        const invalidDto = buildInvalidDto({
                            [propertyName]: value,
                        } as DTO<TAggregate>);

                        const invalidInstance = new AggregateCtor(invalidDto);

                        const result = invalidInstance.validateInvariants();

                        assertCoscradDataTypeAndTopLevelError(result, 'id', TopLevelErrorCtor);
                    });
                });
            });
        });
    });
};
