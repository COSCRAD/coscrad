import { writeFileSync } from 'fs';
import { getValidatorForEntity } from '../domain/domainModelValidators';
import categoryValidator from '../domain/domainModelValidators/categoryValidator';
import validateEdgeConnection from '../domain/domainModelValidators/contextValidators/validateEdgeConnection';
import tagValidator from '../domain/domainModelValidators/tagValidator';
import { isValid, Valid } from '../domain/domainModelValidators/Valid';
import { Category } from '../domain/models/categories/entities/category.entity';
import { EdgeConnectionMemberRole } from '../domain/models/context/edge-connection.entity';
import { Resource } from '../domain/models/resource.entity';
import getId from '../domain/models/shared/functional/getId';
import idEquals from '../domain/models/shared/functional/idEquals';
import {
    isResourceType,
    ResourceType,
    ResourceTypeToResourceModel,
} from '../domain/types/ResourceType';
import { isNullOrUndefined } from '../domain/utilities/validation/is-null-or-undefined';
import isStringWithNonzeroLength from '../lib/utilities/isStringWithNonzeroLength';
import { getArangoCollectionIDFromResourceType } from '../persistence/database/collection-references/getArangoCollectionIDFromResourceType';
import { DTO } from '../types/DTO';
import buildTestData from './buildTestData';
import convertInMemorySnapshotToDatabaseFormat from './utilities/convertInMemorySnapshotToDatabaseFormat';

/**
 * TODO [https://www.pivotaltracker.com/story/show/182134037]
 *
 * Break out mapping test data to database format into separate
 * utilities.
 */
type InMemorySnapshotOfResourceDTOs = {
    [K in keyof ResourceTypeToResourceModel]?: DTO<ResourceTypeToResourceModel>[K][];
};

describe('buildTestData', () => {
    const testData = buildTestData();

    const {
        categoryTree: categoryTestData,
        connections: connectionTestData,
        resources: resourceTestData,
        tags: tagTestData,
        users: userTestData,
    } = testData;

    const resourceTestDataDTOs = Object.entries(resourceTestData).reduce(
        (accumulatedDataWithDtos: InMemorySnapshotOfResourceDTOs, [ResourceType, instances]) => ({
            ...accumulatedDataWithDtos,
            [ResourceType]: instances.map((instance) => instance.toDTO()),
        }),
        {}
    );

    describe('test data for resources', () => {
        describe('the resulting test data', () => {
            Object.values(ResourceType).forEach((key) => {
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
        // TODO Leverage `validateExternalState` for this
        it(`should have no duplicate IDs`, () => {
            const allIds = connectionTestData
                .map((connection) => connection.id)
                /**
                 * We have a separate check for missing `id` properties
                 */
                .filter((id) => !isNullOrUndefined(id));

            const numberOfIds = allIds.length;

            const numberOfUniqueIds = [...new Set(allIds)].length;

            expect(numberOfUniqueIds).toEqual(numberOfIds);
        });

        const doesMemberWithResourceTypeAndRoleExist = (
            targetResourceType: ResourceType,
            targetRole: EdgeConnectionMemberRole
        ) =>
            connectionTestData
                .flatMap(({ members }) => members)
                .filter(({ compositeIdentifier: { type } }) => type === targetResourceType)
                .some(({ role }) => role === targetRole);

        Object.values(ResourceType).forEach((resourceType) => {
            /**
             * Ensure there is a `self`,`to`, and `from` edge connection instance
             * for each resource type.
             */
            describe(`the resource type: ${resourceType}`, () => {
                Object.values(EdgeConnectionMemberRole).forEach((role) => {
                    it(`should have one instance that is associated with a ${role} connection`, () => {
                        const result = doesMemberWithResourceTypeAndRoleExist(resourceType, role);

                        expect(result).toBe(true);
                    });
                });
            });
        });

        connectionTestData
            .filter(({ id }) => id === '3002')
            .forEach((edgeConnection) => {
                describe(`Edge Connection: ${edgeConnection.id}`, () => {
                    it(`should satisfy the invariants for an Edge Connection`, () => {
                        const validationResult = validateEdgeConnection(edgeConnection);

                        expect(validationResult).toBe(Valid);
                    });

                    const { members } = edgeConnection;

                    members.forEach(
                        ({
                            compositeIdentifier: { id: memberId, type: resourceType },
                            context,
                        }) => {
                            describe(`the member with composite ID ${resourceType}/${memberId}`, () => {
                                it(`should reference resource instances that are in the test data`, () => {
                                    const areAllResourcesInSnapshot = resourceTestData[
                                        resourceType
                                    ].some(
                                        ({ id: resourceInstanceId }) =>
                                            resourceInstanceId === memberId
                                    );

                                    expect(areAllResourcesInSnapshot).toBe(true);
                                });

                                describe(`its context`, () => {
                                    it(`should be consistent with the state of ${resourceType}/${memberId}`, () => {
                                        const correspondingResourceInstance = (
                                            resourceTestData[resourceType] as { id: string }[]
                                        ).find(idEquals(memberId)) as Resource;

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

        describe('tag test data', () => {
            it('should contain tags that satisfy invariant validation rules', () => {
                const tagsThatFailInvariantValidation = tagTestData.filter(
                    // Note it's ok to pass an instance to a DTO validator
                    (tag) => !isValid(tagValidator(tag))
                );

                expect(tagsThatFailInvariantValidation).toEqual([]);
            });

            it('should reference only entities that exist in the test data', () => {
                const categoriesWithResourcesThatAreNotInSnapshot = tagTestData.filter(
                    (tag) => !isValid(tag.validateExternalState(testData))
                );

                expect(categoriesWithResourcesThatAreNotInSnapshot).toEqual([]);
            });
        });

        describe('category test data', () => {
            it('should contain categories that satisfy invariant validation rules', () => {
                const categoriesThatFailInvariantValidation = categoryTestData.filter(
                    (categoryNodeDTO) => !isValid(categoryValidator(categoryNodeDTO))
                );

                expect(categoriesThatFailInvariantValidation).toEqual([]);
            });

            it('should reference only entities that exist in the test data', () => {
                const categoriesWithResourcesThatAreNotInSnapshot = categoryTestData
                    .map((categoryNode) => new Category(categoryNode))
                    .filter((category) => !isValid(category.validateExternalState(testData)));

                expect(categoriesWithResourcesThatAreNotInSnapshot).toEqual([]);
            });

            it('should reference only other categories in the test data as child categories', () => {
                const allChildCategoryIDs = categoryTestData.flatMap(
                    ({ childrenIDs }) => childrenIDs
                );

                const allCategoryIDs = categoryTestData.map(getId);

                const childCategoriesThatDoNotExist = allChildCategoryIDs.filter(
                    (childId) => !allCategoryIDs.includes(childId)
                );

                expect(childCategoriesThatDoNotExist).toEqual([]);
            });
        });
    });

    describe('the test data for users', () => {
        userTestData.forEach((user) => {
            describe(`user test data with id: ${user.id}`, () => {
                it('should satisfy invariant validation', () => {
                    const validationResult = user.validateInvariants();

                    expect(validationResult).toBe(Valid);
                });
            });
        });
    });

    // If the test succeeds, write the data
    afterAll(() => {
        const fullSnapshotInDatabaseFormat = convertInMemorySnapshotToDatabaseFormat(testData);

        const testDataFilePath = `${process.cwd()}/scripts/arangodb-docker-container-setup/docker-container-scripts/test-data/testData.json`;

        const numberOfSpacesToIndent = 4;

        writeFileSync(
            testDataFilePath,
            JSON.stringify(fullSnapshotInDatabaseFormat, null, numberOfSpacesToIndent).concat('\n')
        );
    });
});
