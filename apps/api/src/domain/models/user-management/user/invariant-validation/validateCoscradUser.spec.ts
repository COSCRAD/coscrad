import NullOrUndefinedCoscradUserDTOError from '../../../../../domain/domainModelValidators/errors/user-management/NullOrUndefinedCoscradUserDTOError';
import { DTO } from '../../../../../types/DTO';
import InvalidCoscradUserDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserDTOError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import assertTypeErrorsFromInvalidFuzz from '../../../__tests__/invariant-validation-helpers/assertTypeErrorsFromInvalidFuzz';
import { CoscradUserProfile } from '../entities/user/coscrad-user-profile.entity';
import { CoscradUser } from '../entities/user/coscrad-user.entity';
import validateCoscradUser from './validateCoscradUser';

const validUserDto: DTO<CoscradUser> = {
    type: AggregateType.user,
    authProviderUserId: 'auth0|9358793208590235832',
    username: 'joeyDoughy001@fastmail.org',
    id: '939384394839',
    profile: new CoscradUserProfile({
        email: 'me@you.com',
        name: { firstName: 'Joey', lastName: 'Doughy' },
    }).toDTO(),
    roles: [],
    eventHistory: [],
};

const validUser = new CoscradUser(validUserDto);

describe('validateCoscradUser', () => {
    describe('when the user is valid', () => {
        it('should return Valid', () => {
            const result = validUser.validateInvariants();

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

        describe('when a simple invariant validation (type) rule is violated', () => {
            describe('when a property has an invalid type', () => {
                assertTypeErrorsFromInvalidFuzz(
                    CoscradUser,
                    validUserDto,
                    InvalidCoscradUserDTOError
                );
            });
        });

        // TODO Add test coverage for user profile!
    });
});
