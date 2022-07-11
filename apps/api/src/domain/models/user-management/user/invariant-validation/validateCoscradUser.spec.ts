import NullOrUndefinedCoscradUserDTOError from '../../../../../domain/domainModelValidators/errors/user-management/NullOrUndefinedCoscradUserDTOError';
import { InternalError } from '../../../../../lib/errors/InternalError';
import clonePlainObjectWithoutProperty from '../../../../../lib/utilities/clonePlainObjectWithoutProperty';
import { DTO } from '../../../../../types/DTO';
import InvalidCoscradUserDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { CoscradUserProfile } from '../entities/coscrad-user-profile.entity';
import { CoscradUser } from '../entities/coscrad-user.entity';
import validateCoscradUser from './validateCoscradUser';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182694263]
 * Move this to our utility types lib.
 */
export type Ctor<T> = new (...args: unknown[]) => T;

const assertCoscradDataTypeError = (
    error: InternalError,
    propertyKey: string,
    TopLevelErrorCtor: Ctor<InternalError>
) => {
    expect(error).toBeInstanceOf(TopLevelErrorCtor);

    expect(error.toString().includes(propertyKey)).toBe(true);
};

const validUser: DTO<CoscradUser> = {
    type: AggregateType.user,
    username: 'joeyDoughy001@fastmail.org',
    id: '939384394839',
    profile: new CoscradUserProfile({
        email: 'me@you.com',
        name: { firstName: 'Joey', middleNames: ['Roley', 'Poley'], lastName: 'Doughy' },
    }).toDTO(),
    roles: [],
    eventHistory: [],
};

const buildInvalidUserDto = (overrides: { [K in keyof CoscradUser]?: unknown }): DTO<CoscradUser> =>
    ({
        ...validUser,
        ...overrides,
    } as DTO<CoscradUser>);

describe('validateCoscradUser', () => {
    describe('when the user is valid', () => {
        it('should return Valid', () => {
            const result = new CoscradUser(validUser).validateInvariants();

            expect(result).toBe(Valid);
        });
    });

    describe('when the user is invalid', () => {
        describe('when the user is undefined', () => {
            it('should return the expected error', () => {
                const result = validateCoscradUser(undefined);

                expect(result).toEqual(new NullOrUndefinedCoscradUserDTOError());
            });
        });

        /**
         * TODO [https://www.pivotaltracker.com/story/show/182217249]
         * Generate this test data using a fuzz generation utility. This
         * part of the current test could serve as inspiration and a first
         * test bed for said utility.
         */
        describe('when a simple invariant validation (type) rule is violated', () => {
            describe('when a required property is missing', () => {
                ['id', 'username', 'profile', 'roles'].forEach((propertyName) => {
                    describe(`when ${propertyName} is missing`, () => {
                        it('should return the expected error', () => {
                            const invalidDto = clonePlainObjectWithoutProperty(
                                validUser,
                                propertyName
                            );

                            const invalidInstance = new CoscradUser(
                                invalidDto as unknown as DTO<CoscradUser>
                            );

                            const result = invalidInstance.validateInvariants();

                            expect(result).toBeInstanceOf(InvalidCoscradUserDTOError);

                            if (!(result instanceof InvalidCoscradUserDTOError)) {
                                throw new InternalError(`inconsistency in test execution!`);
                            }

                            const innerError = result.innerErrors[0];

                            expect(innerError.message.includes(propertyName)).toBe(true);
                        });
                    });
                });
            });

            describe('when a property has an invalid type', () => {
                describe('when id has an invalid type', () => {
                    const invalidValuesAndLabels = [
                        [['foo'], 'string array'],
                        [890, 'number'],
                        ['', 'empty string'],
                    ];

                    invalidValuesAndLabels.forEach(([invalidValue, label]) => {
                        describe(`when id has the type ${label} (${invalidValue})`, () => {
                            it('should return the expected error', () => {
                                const result = new CoscradUser(
                                    buildInvalidUserDto({
                                        id: invalidValue,
                                    })
                                ).validateInvariants();

                                expect(result).toBeInstanceOf(InternalError);

                                const error = result as InternalError;

                                assertCoscradDataTypeError(error, 'id', InvalidCoscradUserDTOError);
                            });
                        });
                    });
                });

                describe('when username has an invalid type', () => {
                    const invalidValuesAndLabels = [
                        [['foo'], 'string array'],
                        [890, 'number'],
                        ['', 'empty string'],
                    ];

                    invalidValuesAndLabels.forEach(([invalidValue, label]) => {
                        describe(`when username has the type ${label} (${invalidValue})`, () => {
                            it('should return the expected error', () => {
                                const result = new CoscradUser(
                                    buildInvalidUserDto({
                                        username: invalidValue,
                                    })
                                ).validateInvariants();

                                expect(result).toBeInstanceOf(InternalError);

                                const error = result as InternalError;

                                assertCoscradDataTypeError(
                                    error,
                                    'username',
                                    InvalidCoscradUserDTOError
                                );
                            });
                        });
                    });
                });

                describe('when the roles property has an invalid type', () => {
                    const invalidValuesAndLabels = [
                        [['foo'], 'string array'],
                        [890, 'number'],
                        ['', 'empty string'],
                        ['not in this enum!', 'string, but not in the enum'],
                    ];

                    invalidValuesAndLabels.forEach(([invalidValue, label]) => {
                        describe(`when roles has the type ${label} (${invalidValue})`, () => {
                            it('should return the expected error', () => {
                                const result = new CoscradUser(
                                    buildInvalidUserDto({
                                        roles: invalidValue,
                                    })
                                ).validateInvariants();

                                expect(result).toBeInstanceOf(InternalError);

                                const error = result as InternalError;

                                assertCoscradDataTypeError(
                                    error,
                                    'roles',
                                    InvalidCoscradUserDTOError
                                );
                            });
                        });
                    });
                });

                // TODO Add test coverage for user profile!
            });
        });
    });
});
