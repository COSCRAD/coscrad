import assertTypeErrorsFromInvalidFuzz from '../../../../../../domain/models/__tests__/invariant-validation-helpers/assertTypeErrorsFromInvalidFuzz';
import { DTO } from '../../../../../../types/DTO';
import InvalidCoscradUserGroupDTOError from '../../../../../domainModelValidators/errors/InvalidCoscradUserGroupDTOError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../../types/AggregateType';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { CoscradUserGroup } from '../coscrad-user-group.entity';

const validGroupDto: DTO<CoscradUserGroup> = {
    type: AggregateType.userGroup,
    id: buildDummyUuid(),
    label: 'test user group',
    userIds: ['123'],
    description: 'This is a test user group.',
};

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
            assertTypeErrorsFromInvalidFuzz(
                CoscradUserGroup,
                validGroupDto,
                InvalidCoscradUserGroupDTOError
            );
        });
    });
});
