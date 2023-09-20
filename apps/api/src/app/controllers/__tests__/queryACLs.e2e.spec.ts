import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { Resource } from '../../../domain/models/resource.entity';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import getId from '../../../domain/models/shared/functional/getId';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../test-data/buildTestData';
import { BaseViewModel } from '../../../view-models/buildViewModelForResource/viewModels/base.view-model';
import formatAggregateType from '../../../view-models/presentation/formatAggregateType';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildIndexPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

const PRIVATE_ACL_OK_ID_PREFIX = 'PRIVATE-ACL-OK-';

const CONFIDENTIAL_ID_PREFIX = 'CONFIDENTIAL-';

const PUBLISHED_ID_PREFIX = 'PUBLISHED-';

const { user: users, userGroup: userGroups } = buildTestData();

const dummyUser = users[0].clone({
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = userGroups[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

const assertIndexOkResponse = (
    res: request.Response,
    resourcesWhoseViewModelsShouldBeFound: Resource[]
) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    const viewModels = res.body.entities;

    expect(viewModels.every((viewModel) => viewModel instanceof BaseViewModel));

    const allFoundViewModelIds = viewModels.map(getId).sort();

    expect(allFoundViewModelIds).toEqual(resourcesWhoseViewModelsShouldBeFound.map(getId).sort());
};

const assertDetailOkResponse = (res: request.Response, resourceToFind: Resource) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    const viewModel = res.body;

    expect(viewModel.id).toBe(resourceToFind.id);
};

const checkThatDetailQueryFinds = async (
    resourceToFind: Resource,
    app: INestApplication,
    buildDetailEndpoint: (id: AggregateId) => string
) => {
    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(resourceToFind.id));

    assertDetailOkResponse(res, resourceToFind);
};

const checkThatDetailQueryDoesNotFind = async (
    resourceToFind: Resource,
    app: INestApplication,
    buildDetailEndpoint: (id: AggregateId) => string
) => {
    await request(app.getHttpServer())
        .get(buildDetailEndpoint(resourceToFind.id))
        .expect(httpStatusCodes.notFound);
};

const fullSnapshotOfResources = buildTestData().resources;

const eventSourcedResourceTypes = [ResourceType.song];

describe('Access Control List and Role Based filtering in resource queries', () => {
    Object.values(ResourceType)
        // TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced resources in this test
        .filter((rt) => !eventSourcedResourceTypes.includes(rt))
        .forEach((resourceType) => {
            const endpointUnderTest = `/${buildViewModelPathForResourceType(resourceType)}`;

            const indexEndpoint = endpointUnderTest;

            const buildDetailEndpoint = (idToQuery: string) => `${indexEndpoint}/${idToQuery}`;

            const unpublishedResourceWithUserInACL = getValidAggregateInstanceForTest(
                resourceType
            ).clone({
                published: false,
                queryAccessControlList: new AccessControlList().allowUser(dummyUserWithGroups.id),
            });

            const numberOfPrivateResourcesToFind = 8;

            const privateResourcesTheUserCanQuery = Array(numberOfPrivateResourcesToFind)
                .fill(unpublishedResourceWithUserInACL)
                .map((resource: Resource, index) =>
                    resource.clone({
                        id: `${PRIVATE_ACL_OK_ID_PREFIX}${index.toString()}`,
                    })
                );

            const numberOfPublishedResources = 5;

            const publicResources = Array(numberOfPublishedResources)
                .fill(unpublishedResourceWithUserInACL.clone({ published: true }))
                .map((resource: Resource, index) =>
                    resource.clone({
                        id: `${PUBLISHED_ID_PREFIX}${(
                            index + numberOfPrivateResourcesToFind
                        ).toString()}`,
                    })
                );

            const confidentialResources = privateResourcesTheUserCanQuery.map(
                (resource: Resource, index) =>
                    resource.clone({
                        id: `${CONFIDENTIAL_ID_PREFIX}${(
                            index +
                            numberOfPrivateResourcesToFind +
                            numberOfPublishedResources
                        ).toString()}`,
                        // The user does not have permission to query this resource
                        queryAccessControlList: new AccessControlList(),
                    })
            );

            const allResourcesOfCurrentType = [
                ...privateResourcesTheUserCanQuery,
                ...publicResources,
                ...confidentialResources,
            ];

            describe(`when querying for ${formatAggregateType(resourceType)}`, () => {
                describe('when the user is authenticated, and not a project or COSCRAD admin', () => {
                    let app: INestApplication;

                    let databaseProvider: ArangoDatabaseProvider;

                    let testRepositoryProvider: TestRepositoryProvider;

                    beforeAll(async () => {
                        ({ app, testRepositoryProvider, databaseProvider } =
                            await setUpIntegrationTest(
                                {
                                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                                },
                                {
                                    testUserWithGroups: dummyUserWithGroups,
                                }
                            ));
                    });

                    afterAll(async () => {
                        await app.close();

                        databaseProvider.close();
                    });

                    beforeEach(async () => {
                        await testRepositoryProvider.testSetup();

                        await testRepositoryProvider.addFullSnapshot(
                            buildInMemorySnapshot({
                                user: [dummyUser],
                                userGroup: [dummyGroup],
                                resources: {
                                    ...fullSnapshotOfResources,
                                    [resourceType]: allResourcesOfCurrentType,
                                },
                            })
                        );
                    });

                    describe('when querying for many resources (fetch many)', () => {
                        it('should find unpublished resources when the user is in the ACL', async () => {
                            const resourcesWhoseViewModelsShouldBeFound = [
                                ...publicResources,
                                ...privateResourcesTheUserCanQuery,
                            ];

                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            assertIndexOkResponse(res, resourcesWhoseViewModelsShouldBeFound);
                        });

                        it('should not find any index actions', async () => {
                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            expect(res.body.indexScopedActions).toEqual([]);
                        });

                        it('should not find any detail-scoped actions', async () => {
                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            const entitiesWithActions = res.body.entities.filter(
                                ({ actions }) => actions.length > 0
                            );

                            expect(entitiesWithActions.length).toBe(0);
                        });
                    });

                    describe('when querying for a single resource by ID (fetch by ID)', () => {
                        describe('when the resource is published', () => {
                            it('should be found', async () => {
                                await checkThatDetailQueryFinds(
                                    publicResources[0],
                                    app,
                                    buildDetailEndpoint
                                );
                            });

                            it('should not find any actions', async () => {
                                const resourceToFind = publicResources[0];

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(resourceToFind.id)
                                );

                                const numberOfAvailableActions = res.body.actions.length;

                                expect(numberOfAvailableActions).toBe(0);
                            });
                        });

                        describe('when the resource is unpublished', () => {
                            describe('when the user is in the query ACL for the resource', () => {
                                it('should be found', async () => {
                                    await checkThatDetailQueryFinds(
                                        privateResourcesTheUserCanQuery[0],
                                        app,
                                        buildDetailEndpoint
                                    );
                                });
                            });

                            describe('when the user is not in the query ACL for the resource', () => {
                                it('should return not found', async () => {
                                    await checkThatDetailQueryDoesNotFind(
                                        confidentialResources[0],
                                        app,
                                        buildDetailEndpoint
                                    );
                                });
                            });
                        });
                    });
                });

                (
                    [
                        [CoscradUserRole.superAdmin, 'when the user is a COSCRAD admin'],
                        [CoscradUserRole.projectAdmin, 'when the user is a project admin'],
                    ] as const
                ).forEach(([userRole, description]) => {
                    describe(description, () => {
                        let app: INestApplication;

                        let databaseProvider: ArangoDatabaseProvider;

                        let testRepositoryProvider: TestRepositoryProvider;

                        const dummyAdminUser = dummyUser.clone({
                            roles: [userRole],
                        });

                        const dummyAdminUserWithGroups = new CoscradUserWithGroups(
                            dummyAdminUser,
                            []
                        );

                        beforeAll(async () => {
                            ({ app, testRepositoryProvider, databaseProvider } =
                                await setUpIntegrationTest(
                                    {
                                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                                    },
                                    {
                                        testUserWithGroups: dummyAdminUserWithGroups,
                                    }
                                ));
                        });

                        beforeEach(async () => {
                            await testRepositoryProvider.testSetup();

                            await testRepositoryProvider.addFullSnapshot(
                                buildInMemorySnapshot({
                                    user: [dummyAdminUser],
                                    userGroup: [dummyGroup],
                                    resources: {
                                        ...fullSnapshotOfResources,
                                        [resourceType]: allResourcesOfCurrentType,
                                    },
                                })
                            );
                        });

                        afterAll(async () => {
                            await app.close();

                            databaseProvider.close();
                        });

                        describe('when querying for many resources (fetch many)', () => {
                            it('should find all resources of the given kind', async () => {
                                const res = await request(app.getHttpServer()).get(indexEndpoint);

                                assertIndexOkResponse(res, allResourcesOfCurrentType);
                            });
                        });

                        describe('when querying for a single resource by ID (fetch by ID)', () => {
                            describe('when the resource is published', () => {
                                it('should be found', async () => {
                                    await checkThatDetailQueryFinds(
                                        publicResources[0],
                                        app,
                                        buildDetailEndpoint
                                    );
                                });
                            });

                            describe('when the resource is unpublished', () => {
                                it('should be found', async () => {
                                    await checkThatDetailQueryFinds(
                                        confidentialResources[0],
                                        app,
                                        buildDetailEndpoint
                                    );
                                });
                            });
                        });
                    });
                });

                describe('when the user is not authenticated (public request)', () => {
                    let app: INestApplication;

                    let databaseProvider: ArangoDatabaseProvider;

                    let testRepositoryProvider: TestRepositoryProvider;

                    beforeAll(async () => {
                        ({ app, testRepositoryProvider, databaseProvider } =
                            await setUpIntegrationTest(
                                {
                                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                                }
                                // no test user will be on the request
                            ));
                    });

                    afterAll(async () => {
                        await app.close();

                        databaseProvider.close();
                    });

                    beforeEach(async () => {
                        await testRepositoryProvider.testSetup();

                        await testRepositoryProvider.addFullSnapshot(
                            buildInMemorySnapshot({
                                resources: {
                                    ...fullSnapshotOfResources,
                                    [resourceType]: allResourcesOfCurrentType,
                                },
                            })
                        );
                    });

                    describe('when querying for many resources (fetch many)', () => {
                        it('should return only public results', async () => {
                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            assertIndexOkResponse(res, publicResources);
                        });
                    });

                    describe('when querying for a single resource by ID (fetch by ID)', () => {
                        describe('when the resource is published', () => {
                            it('should be found', async () => {
                                await checkThatDetailQueryFinds(
                                    publicResources[0],
                                    app,
                                    buildDetailEndpoint
                                );
                            });
                        });

                        describe('when the resource is unpublished', () => {
                            it('should not be found', async () => {
                                await checkThatDetailQueryDoesNotFind(
                                    confidentialResources[0],
                                    app,
                                    buildDetailEndpoint
                                );
                            });
                        });
                    });
                });
            });
        });
});
