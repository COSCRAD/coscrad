import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import assertErrorAsExpected from '../../../lib/__tests__/assertErrorAsExpected';
import buildTestDataInFlatFormat from '../../../test-data/buildTestDataInFlatFormat';
import { DTO } from '../../../types/DTO';
import { AggregateType } from '../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../types/DeluxeInMemoryStore';
import { PartialSnapshot } from '../../types/PartialSnapshot';
import { dummyUuid } from '../__tests__/utilities/dummyUuid';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import { ISpatialFeature } from '../spatial-feature/interfaces/spatial-feature.interface';
import { CoscradUserGroup } from '../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../user-management/user/entities/user/coscrad-user.entity';

/**
 * The `CoscradUser` is exceptional in that an instance has additional fields that must
 * be unique amongst all `CoscradUsers` besides the `id`.
 */
const userDtoOverrides: Partial<DTO<CoscradUser>> = {
    authProviderUserId: 'unique-auth-prov-id-123',
    username: 'unique-username',
};

const spatialFeatureDtoOverrides: Partial<DTO<ISpatialFeature>> = {
    properties: {
        name: `unique name`,
        description: `I have my own name and promise not to take yours!`,
    },
};

const userGroupDtoOverrides: Partial<DTO<CoscradUserGroup>> = {
    label: 'unique-user-group-label',
};

const overridesMap = new Map()
    .set(AggregateType.user, userDtoOverrides)
    .set(AggregateType.userGroup, userGroupDtoOverrides)
    .set(AggregateType.spatialFeature, spatialFeatureDtoOverrides);

Object.values(AggregateType).forEach((aggregateType) => {
    /**
     * TODO We originally put the responsibility of ensuring all aggregates of
     * a given type have unique IDs on the model via a `validateExternalState`
     * method. This is also used to enforce other uniqueness constraints, such
     * as that each aggregate of type X has a uniqe value of a given property (e.g., name).
     * While the latter may be a valid reponsibility of the aggregate instance,
     * we should prevent ID collisions at a higher level. Our base command handler
     * should automatically check this.
     *
     * For this reason, we are skipping this test.
     */
    describe.skip(`An aggregate of the type: ${aggregateType}`, () => {
        const existingAggregate = getValidAggregateInstanceForTest(aggregateType).clone({
            id: dummyUuid,
        });

        const dummyAggregate = existingAggregate.clone({
            // Let's find a more elegant way to do this if there is a second exceptional case
            ...(overridesMap.has(aggregateType) ? overridesMap.get(aggregateType) : {}),
        });

        // TODO We need to add this to the existing snapshot from buildTestData
        const partialSnapshot: PartialSnapshot = {
            [aggregateType]: [existingAggregate],
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
                    new AggregateIdAlreadyInUseError(dummyAggregate.getCompositeIdentifier()),
                ]);

                assertErrorAsExpected(result, expectedError);
            });
        });
    });
});
