import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import validateEdgeConnection from '../domain/domainModelValidators/contextValidators/validateEdgeConnection';
import { isValid, Valid } from '../domain/domainModelValidators/Valid';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
} from '../domain/models/context/edge-connection.entity';
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
import mapEdgeConnectionDTOToArangoEdgeDocument from '../persistence/database/utilities/mapEdgeConnectionDTOToArangoEdgeDocument';
import mapEntityDTOToDatabaseDTO from '../persistence/database/utilities/mapEntityDTOToDatabaseDTO';
import { DTO } from '../types/DTO';
import buildTestData from './buildTestData';

export type InMemorySnapshotOfResourceDTOs = {
    [K in keyof ResourceTypeToInstance]?: DTO<ResourceTypeToInstance>[K][];
};

type InMemorySnapshotOfConnectionDTOs = {
    connections?: DTO<EdgeConnection>[];
};

type InMemorySnapshotOfDTOs = {
    resources: InMemorySnapshotOfResourceDTOs;
} & InMemorySnapshotOfConnectionDTOs;

describe('buildTestData', () => {
    const testData = buildTestData();

    const { connections: connectionTestData, resources: resourceTestData } = testData;

    const resourceTestDataDTOs = Object.entries(resourceTestData).reduce(
        (accumulatedDataWithDtos: InMemorySnapshotOfResourceDTOs, [ResourceType, instances]) => ({
            ...accumulatedDataWithDtos,
            [ResourceType]: instances.map((instance) => instance.toDTO()),
        }),
        {}
    );

    const connectionTestDataDTOs = connectionTestData.map((instance) => instance.toDTO());

    describe('test data for resources', () => {
        describe('the resulting test data', () => {
            Object.values(resourceTypes).forEach((key) => {
                const models = resourceTestDataDTOs[key];
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
                });
            });
        });
    });

    describe('test data for edge connections', () => {
        const doesMemberWithResourceTypeAndRoleExist = (
            targetResourceType: ResourceType,
            targetRole: EdgeConnectionMemberRole
        ) =>
            connectionTestData
                .flatMap(({ members }) => members)
                .filter(({ compositeIdentifier: { type } }) => type === targetResourceType)
                .some(({ role }) => role === targetRole);

        Object.values(resourceTypes)
            /**
             * TODO [https://www.pivotaltracker.com/story/show/181861405]
             *
             * Remove this filter.
             */
            .filter((resourceType) => resourceType !== resourceTypes.tag)
            .forEach((resourceType) => {
                /**
                 * Ensure there is a `self`,`to`, and `from` edge connection instance
                 * for each resource type.
                 */
                describe(`the resource type: ${resourceType}`, () => {
                    Object.values(EdgeConnectionMemberRole).forEach((role) => {
                        it(`should have one instance that is associated with a ${role} connection`, () => {
                            const result = doesMemberWithResourceTypeAndRoleExist(
                                resourceType,
                                role
                            );

                            expect(result).toBe(true);
                        });
                    });
                });
            });

        connectionTestData.forEach((edgeConnection, index) => {
            describe(`Edge Connection at index ${index}`, () => {
                it(`should satisfy the invariants for an Edge Connection`, () => {
                    const validationResult = validateEdgeConnection(edgeConnection);

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

                                    expect(validationResult).toBe(Valid);
                                });
                            });
                        });
                    }
                );
            });
        });
    });

    // If the test succeeds, write the data
    afterAll(() => {
        const resourceTestDataInDatabaseFormat =
            // Use `collectionNames` not `resourceTypes` as keys
            Object.entries(resourceTestDataDTOs).reduce(
                (acc, [key, models]) => ({
                    ...acc,
                    [getArangoCollectionIDFromResourceType(key as ResourceType)]: models.map(
                        (model) => mapEntityDTOToDatabaseDTO(model)
                    ),
                }),
                {}
            );

        const connectionTestDataInDatabaseFormat = connectionTestDataDTOs.map(
            mapEdgeConnectionDTOToArangoEdgeDocument
        );

        const fullSnapshotInDatabaseFormat = {
            resources: resourceTestDataInDatabaseFormat,
            // note the change in this key ~~connections~~ -> edges
            resource_edge_connections: connectionTestDataInDatabaseFormat,
        };

        // TODO move this to a config- better yet avoid this whole write!
        const testDataFilePath = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json`;

        const numberOfSpacesToIndent = 4;

        writeFileSync(
            testDataFilePath,
            JSON.stringify(fullSnapshotInDatabaseFormat, null, numberOfSpacesToIndent)
        );
    });
});
