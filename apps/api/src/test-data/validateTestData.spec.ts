import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import edgeConnectionValidator from '../domain/domainModelValidators/contextValidators/edgeConnectionValidator';
import { isValid, Valid } from '../domain/domainModelValidators/Valid';
import { EdgeConnectionMemberRole } from '../domain/models/context/edge-connection.entity';
import { Resource } from '../domain/models/resource.entity';
import {
    isResourceType,
    ResourceType,
    resourceTypes,
    ResourceTypeToInstance,
} from '../domain/types/resourceTypes';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import isStringWithNonzeroLength from '../lib/utilities/isStringWithNonzeroLength';
import { getArangoCollectionIDFromResourceType } from '../persistence/database/getArangoCollectionIDFromResourceType';
import mapEntityDTOToDatabaseDTO from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { PartialDTO } from '../types/partial-dto';
import buildTestData from './buildTestData';

export type InMemorySnapshotOfDTOs = {
    [K in keyof ResourceTypeToInstance]?: PartialDTO<ResourceTypeToInstance>[K][];
};

describe('buildTestData', () => {
    describe('test data for resources', () => {
        describe('the resulting test data', () => {
            const resourceTestData = buildTestData().resources;

            const testData = Object.entries(resourceTestData).reduce(
                (accumulatedDataWithDtos: InMemorySnapshotOfDTOs, [ResourceType, instances]) => ({
                    ...accumulatedDataWithDtos,
                    [ResourceType]: instances.map((instance) => instance.toDTO()),
                }),
                {}
            );

            Object.values(resourceTypes).forEach((key) => {
                const models = testData[key];
                describe(`Resource of type ${key}`, () => {
                    it(`Should be a valid entity type`, () => {
                        expect(isResourceType(key)).toBe(true);
                    });

                    const ResourceType = key as ResourceType;
                    it(`should have a corresponding collection name`, () => {
                        const collectionName = getArangoCollectionIDFromResourceType(ResourceType);

                        expect(isStringWithNonzeroLength(collectionName)).toBe(true);
                    });

                    describe(`the DTOs`, () => {
                        /**
                         * TODO Also check that entitiy types that correspond to a
                         * union of models have at least one example of each member
                         * of the union. (See e.g. `Spatial Feature`)
                         */
                        it(`should have at least one test data DTO`, () => {
                            const numberOfTestDataEntries = models.length;

                            expect(numberOfTestDataEntries).toBeGreaterThan(0);
                        });
                        it(`should have no duplicate IDs`, () => {
                            const allIds = models
                                .map((model) => model.id)
                                /**
                                 * We have a separate check for missing `id` properties
                                 */
                                .filter((id) => !isNullOrUndefined(id));

                            const numberOfIds = allIds.length;

                            const numberOfUniqueIds = [...new Set(allIds)].length;

                            expect(numberOfUniqueIds).toEqual(numberOfIds);
                        });

                        const entityValidator = getValidatorForEntity(ResourceType);

                        models.forEach((dto, index) => {
                            describe(`${ResourceType}(dto # ${index + 1})`, () => {
                                it(`should have an id`, () => {
                                    expect(isStringWithNonzeroLength(dto.id)).toBe(true);
                                });
                                it(`should satisfy invariant validation`, () => {
                                    const validationResult = entityValidator(dto);

                                    expect(isValid(validationResult)).toBe(true);
                                });
                            });
                        });
                    });

                    const testDataInDatabaseFormat =
                        // Use `collectionNames` not `resourceTypes` as keys
                        Object.entries(testData).reduce(
                            (acc, [key, models]) => ({
                                ...acc,
                                [getArangoCollectionIDFromResourceType(key as ResourceType)]:
                                    models.map((model) => mapEntityDTOToDatabaseDTO(model)),
                            }),
                            {}
                        );

                    // TODO move this to a config- better yet avoid this whole write!
                    const testDataFilePath = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json`;

                    const numberOfSpacesToIndent = 4;

                    writeFileSync(
                        testDataFilePath,
                        JSON.stringify(testDataInDatabaseFormat, null, numberOfSpacesToIndent)
                    );
                });
            });
        });
    });

    /**
    We need to validate our Edge Connection test data
        For each ResourceType there should be at least one of each of the following
            an EdgeConnection with a resource of that type as the to member
            an EdgeConnection with a resource of that type as the from member
            a (self) EdgeConnection with a resource of that type as the self memeber
        Every EdgeConnection should satisfy the Edge Connection Invariant Validation
            i.e. we need to pass the EdgeConnection DTOs through the Edge Connection Validator
     */
    describe('test data for edge connections', () => {
        const { connections: connectionTestData, resources: resourceTestData } = buildTestData();

        const doesMemberWithResourceTypeAndRoleExist = (
            targetResourceType: ResourceType,
            targetRole: EdgeConnectionMemberRole
        ) =>
            connectionTestData
                .flatMap(({ members }) => members)
                .filter(({ compositeIdentifier: { type } }) => type === targetResourceType)
                .some(({ role }) => role === targetRole);

        Object.values(resourceTypes).forEach((resourceType) => {
            describe(`the resource type: ${resourceType}`, () => {
                Object.values(EdgeConnectionMemberRole).forEach((role) => {
                    it(`should have one instance that is associated with a ${role} connection`, () => {
                        const result = doesMemberWithResourceTypeAndRoleExist(resourceType, role);

                        expect(result).toBe(true);
                    });
                });
            });
        });

        connectionTestData.forEach((edgeConnection, index) => {
            describe(`Edge Connection at index ${index}`, () => {
                it(`should satisfy the invariants for an Edge Connection`, () => {
                    const validationResult = edgeConnectionValidator(edgeConnection);

                    expect(validationResult).toBe(Valid);
                });

                const { members, tagIDs } = edgeConnection;

                it(`should reference only tags that are in the test data`, () => {
                    const areAllTagsInSnapshot = tagIDs.every((tagID) =>
                        resourceTestData[resourceTypes.tag].some(({ id }) => id === tagID)
                    );

                    expect(areAllTagsInSnapshot).toBe(true);
                });

                members.forEach(
                    ({ compositeIdentifier: { id: memberId, type: resourceType }, context }) => {
                        describe(`the member with composite ID ${resourceType}/${memberId}`, () => {
                            it(`should reference resource instances that are in the test data`, () => {
                                const areAllResourcesInSnapshot = resourceTestData[
                                    resourceType
                                ].some(
                                    ({ id: resourceInstanceId }) => resourceInstanceId === memberId
                                );

                                expect(areAllResourcesInSnapshot).toBe(true);
                            });

                            describe(`its context`, () => {
                                it(`should be consistent with the state of ${resourceType}/${memberId}`, () => {
                                    const correspondingResourceInstance = (
                                        resourceTestData[resourceType] as { id: string }[]
                                    ).find(({ id }) => id === memberId) as Resource;

                                    const validationResult =
                                        correspondingResourceInstance.validateContext(context);

                                    expect(validationResult).toBe(true);
                                });
                            });
                        });
                    }
                );
            });
        });
    });
});
