import { FuzzGenerator, getCoscradDataSchema } from '@coscrad/data-types';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import InvalidCoscradUserGroupDTOError from '../../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../../types/AggregateType';
import { Aggregate } from '../../../../aggregate.entity';
import assertCoscradDataTypeError from '../../../../__tests__/invariant-validation-helpers/assertCoscradDataTypeError';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../coscrad-user-group.entity';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182217249]
 * Let's extract the following to a separate utility- possibly
 * even within the `@coscrad/data-types` lib.
 */

const validGroupDto: DTO<CoscradUserGroup> = {
    type: AggregateType.userGroup,
    id: buildDummyUuid(),
    label: 'test user group',
    userIds: ['123'],
    description: 'This is a test user group.',
};

// TODO [design] Consider making this a class.
const createInvalidAggregateFactory =
    <T extends DTO<Aggregate>>(validAggregate: T) =>
    // TODO Support 'keys to exclude'
    (overrides: { [K in keyof DTO<T>]?: unknown }): DTO<T> =>
        ({
            ...validAggregate,
            ...overrides,
        } as DTO<T>);

const buildInvalidGroupDto = createInvalidAggregateFactory(validGroupDto);

const userGroupDataSchema = getCoscradDataSchema(CoscradUserGroup);

describe('CoscradUserGroup.validateInvariants', () => {
    describe('when the data is valid', () => {
        it('should return Valid', () => {
            const validInstance = new CoscradUserGroup(validGroupDto);

            const result = validInstance.validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe('when the data is invalid', () => {
        describe('when a simple invariant (generalized type) rule fails', () => {
            Object.entries(userGroupDataSchema).forEach(([propertyName, propertySchema]) => {
                describe(`when the property: ${propertyName} is invalid`, () => {
                    const invalidValuesToUse = new FuzzGenerator(
                        propertySchema
                    ).generateInvalidValues();

                    invalidValuesToUse.forEach(({ value, description }) => {
                        describe(`when given the invalid value: ${JSON.stringify(
                            value
                        )} (${description})`, () => {
                            it('should return the expected error', () => {
                                const invalidDto = buildInvalidGroupDto({
                                    id: value,
                                });

                                const invalidInstance = new CoscradUserGroup(invalidDto);

                                const result = invalidInstance.validateInvariants();

                                assertCoscradDataTypeError(
                                    result as InternalError,
                                    'id',
                                    InvalidCoscradUserGroupDTOError
                                );
                            });
                        });
                    });
                });
            });
        });
    });
});
