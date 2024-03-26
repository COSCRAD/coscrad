import { AggregateType } from '@coscrad/api-interfaces';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import InvariantValidationError from '../../../../../domain/domainModelValidators/errors/InvariantValidationError';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { clonePlainObjectWithoutProperties } from '../../../../../lib/utilities/clonePlainObjectWithoutProperties';
import { DTO } from '../../../../../types/DTO';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { FullName } from '../../user/entities/user/full-name.entity';
import { CoscradDate, Month } from '../../utilities/coscrad-date.entity';
import { NotALeapYearError } from '../../utilities/not-a-leap-year.error';
import { CoscradContributor } from './coscrad-contributor.entity';
import { ContributorNotUniquelyIdentifiableUserError } from './errors';

const fullNameDto: DTO<FullName> = {
    firstName: 'Rob',
    lastName: 'Jones',
};

const dobDto: DTO<CoscradDate> = {
    day: 3,
    month: Month.April,
    year: 1944,
};

const compositeId = {
    type: AggregateType.contributor,
    id: buildDummyUuid(5),
};

const validDto: DTO<CoscradContributor> = {
    ...compositeId,
    fullName: fullNameDto,
    dateOfBirth: dobDto,
    shortBio: 'This is the bio for Rob Jones',
};

describe(`CoscradContributor.validateInvariants`, () => {
    describe(`when the dto is valid`, () => {
        it(`should return no errors`, () => {
            const result = new CoscradContributor(validDto).validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe(`when the dto is invalid`, () => {
        describe(`when neither date of birth nor short bio is specified`, () => {
            const invalidDto = clonePlainObjectWithoutProperties(validDto, [
                'shortBio',
                'dateOfBirth',
            ]);

            const result = new CoscradContributor(invalidDto).validateInvariants();

            assertErrorAsExpected(
                result,
                new InvariantValidationError(
                    {
                        type: AggregateType.contributor,
                        id: validDto.id,
                    },
                    [new ContributorNotUniquelyIdentifiableUserError(new FullName(fullNameDto))]
                )
            );
        });

        describe(`when the date is invalid`, () => {
            describe(`February 29, 2013 (not a leap year)`, () => {
                it(`should fail with the expected errors`, () => {
                    const invalidDateDto: DTO<CoscradDate> = {
                        day: 29,
                        month: Month.February,
                        year: 2013,
                    };

                    const result = new CoscradContributor(
                        clonePlainObjectWithOverrides(validDto, {
                            dateOfBirth: invalidDateDto,
                        })
                    ).validateInvariants();

                    assertErrorAsExpected(
                        result,
                        new InvariantValidationError(compositeId, [new NotALeapYearError(2013)])
                    );
                });
            });
        });

        describe(`fuzz test`, () => {
            generateCommandFuzzTestCases(CoscradContributor).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', () => {
                            const result = new CoscradContributor(
                                clonePlainObjectWithOverrides(validDto, {
                                    [propertyName]: invalidValue,
                                })
                            ).validateInvariants();

                            assertErrorAsExpected(
                                result,
                                new InvariantValidationError(compositeId, [])
                            );
                        });
                    });
                }
            );
        });
    });
});
