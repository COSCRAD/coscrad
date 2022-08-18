import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import buildTestDataInFlatFormat from '../../../test-data/buildTestDataInFlatFormat';
import { DTO } from '../../../types/DTO';
import getValidAggregateInstanceForTest from '../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidAggregateInstanceForTest';
import { AggregateType } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { PartialSnapshot } from '../../types/PartialSnapshot';
import AggregateIdAlraedyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { CoscradUserGroup } from '../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';
import { dummyUuid } from '../__tests__/utilities/dummyUuid';

/**
 * The `CoscradUser` is exceptional in that an instance has additional fields that must
 * be unique amongst all `CoscradUsers` besides the `id`.
 */
const userDtoOverrides: Partial<DTO<CoscradUser>> = {
    authProviderUserId: 'unique-auth-prov-id-123',
    username: 'unique-username',
};

const userGroupDtoOverrides: Partial<DTO<CoscradUserGroup>> = {
    label: 'unique-user-group-label',
};

const overridesMap = new Map()
    .set(AggregateType.user, userDtoOverrides)
    .set(AggregateType.userGroup, userGroupDtoOverrides);

Object.values(AggregateType).forEach((aggregateType) => {
    describe(`An aggregate of the type: ${aggregateType}`, () => {
        const existingAggreagte = getValidAggregateInstanceForTest(aggregateType).clone({
            id: dummyUuid,
        });

        const dummyAggregate = existingAggreagte.clone({
            // Let's find a more elegant way to do this if there is a second exceptional case
            ...(overridesMap.has(aggregateType) ? overridesMap.get(aggregateType) : {}),
        });

        // TODO We need to add this to the existing snapshot from buildTestData
        const partialSnapshot: PartialSnapshot = {
            [aggregateType]: [existingAggreagte],
        };

        const testData = buildTestDataInFlatFormat();

        const inMemoryStore = new DeluxeInMemoryStore(testData);

        const externalStateWithSongWithDuplicateId = inMemoryStore
            .append(partialSnapshot)
            .fetchFullSnapshotInLegacyFormat();

        describe('when there is another aggregate of the same type with the same ID', () => {
            it('should return the expected error', () => {
                const result = dummyAggregate.validateExternalState(
                    externalStateWithSongWithDuplicateId
                );

                const expectedError = new InvalidExternalStateError([
                    new AggregateIdAlraedyInUseError(dummyAggregate.getCompositeIdentifier()),
                ]);

                assertErrorAsExpected(result, expectedError);
            });
        });
    });
});
