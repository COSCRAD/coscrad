import { CoscradUserRole } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import getValidResourceInstanceForTest from '../../../domain/domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { Resource } from '../../../domain/models/resource.entity';
import { AccessControlList } from '../../../domain/models/shared/access-control/access-control-list.entity';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { AggregateId } from '../../../domain/types/AggregateId';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { ResourceType } from '../../../domain/types/ResourceType';
import buildInMemorySnapshot from '../../../domain/utilities/buildInMemorySnapshot';
import generateRandomTestDatabaseName from '../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestData from '../../../test-data/buildTestData';
import { BaseViewModel } from '../../../view-models/buildViewModelForResource/viewModels/base.view-model';
import formatAggregateType from '../../../view-models/presentation/formatAggregateType';
import httpStatusCodes from '../../constants/httpStatusCodes';
import buildViewModelPathForResourceType from '../utilities/buildViewModelPathForResourceType';
import setUpIntegrationTest from './setUpIntegrationTest';

const { users, userGroups } = buildTestData();

const dummyUser = users[0];

const dummyGroup = userGroups[0].clone({ userIds: [dummyUser.id] });

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

const BASE_DIGITAL_ASSET_URL = 'https://www.mysound.org/downloads/';

const assertOkResponse = (
    res: request.Response,
    resourcesWhoseViewModelsShouldBeFound: Resource[]
) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    const viewModels = res.body.data.map((result) => result.data);

    expect(viewModels.every((viewModel) => viewModel instanceof BaseViewModel));

    // TODO move this to the functional lib and use it everywhere
    const getId = ({ id }: HasAggregateId): AggregateId => id;

    const allFoundViewModelIds = viewModels.map(getId).sort();

    expect(allFoundViewModelIds).toEqual(resourcesWhoseViewModelsShouldBeFound.map(getId).sort());

    expect(viewModels).toMatchSnapshot();
};

const assertDetailOkResponse = (res: request.Response, resourceToFind: Resource) => {
    expect(res.status).toBe(httpStatusCodes.ok);

    const viewModel = res.body.data;

    expect(viewModel.id).toBe(resourceToFind.id);
};

describe('Access Control List and Role Based filtering in resource queries', () => {
    let app: INestApplication;

    // let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    Object.values(ResourceType).forEach((resourceType) => {
        const endpointUnderTest = `/${buildViewModelPathForResourceType(resourceType)}`;

        const indexEndpoint = `/resources${endpointUnderTest}`;

        const buildDetailEndpoint = (idToQuery: string) => `${indexEndpoint}/${idToQuery}`;

        const unpublishedResourceWithUserInACL = getValidResourceInstanceForTest(
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
                    id: `PRIVATE-ACL-OK-${index.toString()}`,
                })
            );

        const numberOfPublishedResources = 5;

        const publicResources = Array(numberOfPublishedResources)
            .fill(unpublishedResourceWithUserInACL.clone({ published: true }))
            .map((resource: Resource, index) =>
                resource.clone({
                    id: `PUBLISHED-${(index + numberOfPrivateResourcesToFind).toString()}`,
                })
            );

        const confidentialResources = privateResourcesTheUserCanQuery.map(
            (resource: Resource, index) =>
                resource.clone({
                    id: `CONFIDENTIAL-${(
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
                beforeAll(async () => {
                    ({ app, testRepositoryProvider } = await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                            BASE_DIGITAL_ASSET_URL,
                        },
                        {
                            testUserWithGroups: dummyUserWithGroups,
                        }
                    ));
                });

                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();

                    await testRepositoryProvider.addFullSnapshot(
                        buildInMemorySnapshot({
                            users: [dummyUser],
                            userGroups: [dummyGroup],
                            resources: {
                                [resourceType]: allResourcesOfCurrentType,
                            },
                        })
                    );
                });

                afterEach(async () => {
                    // await testRepositoryProvider.testTeardown();
                    // await arangoConnectionProvider.dropDatabaseIfExists();
                    // await app.close();
                });

                describe('when querying for many resources (fetch many)', () => {
                    it('should find unpublished resources when the user is in the ACL', async () => {
                        const resourcesWhoseViewModelsShouldBeFound = [
                            ...publicResources,
                            ...privateResourcesTheUserCanQuery,
                        ];

                        const res = await request(app.getHttpServer()).get(indexEndpoint);

                        assertOkResponse(res, resourcesWhoseViewModelsShouldBeFound);
                    });
                });

                describe('when querying for a single resource by ID (fetch by ID)', () => {
                    describe('when the resource is published', () => {
                        it('should be found', async () => {
                            const resourceToFind = publicResources[0];

                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(resourceToFind.id)
                            );

                            assertDetailOkResponse(res, resourceToFind);
                        });
                    });

                    describe('when the resource is unpublished', () => {
                        describe('when the user is in the query ACL for the resource', () => {
                            it('should be found', async () => {
                                const resourceToFind = privateResourcesTheUserCanQuery[0];

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(resourceToFind.id)
                                );

                                assertDetailOkResponse(res, resourceToFind);
                            });
                        });

                        describe('when the user is not in the query ACL for the resource', () => {
                            it('should return not found', async () => {
                                const resourceToFind = confidentialResources[0];

                                const detailEndpoint = buildDetailEndpoint(resourceToFind.id);

                                await request(app.getHttpServer())
                                    .get(detailEndpoint)
                                    .expect(httpStatusCodes.notFound);
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
                    const dummyAdminUser = dummyUser.clone({
                        roles: [userRole],
                    });

                    const dummyAdminUserWithGroups = new CoscradUserWithGroups(dummyAdminUser, []);

                    beforeAll(async () => {
                        ({ app, testRepositoryProvider } = await setUpIntegrationTest(
                            {
                                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                                BASE_DIGITAL_ASSET_URL,
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
                                users: [dummyAdminUser],
                                userGroups: [dummyGroup],
                                resources: {
                                    [resourceType]: allResourcesOfCurrentType,
                                },
                            })
                        );
                    });

                    afterEach(async () => {
                        // await testRepositoryProvider.testTeardown();
                        // await arangoConnectionProvider.dropDatabaseIfExists();
                        // await app.close();
                    });

                    describe('when querying for many resources (fetch many)', () => {
                        it('should find all resources of the given kind', async () => {
                            const res = await request(app.getHttpServer()).get(indexEndpoint);

                            assertOkResponse(res, allResourcesOfCurrentType);
                        });
                    });

                    describe('when querying for a single resource by ID (fetch by ID)', () => {
                        describe('when the resource is published', () => {
                            it('should be found', async () => {
                                const resourceToFind = publicResources[0];

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(resourceToFind.id)
                                );

                                assertDetailOkResponse(res, resourceToFind);
                            });
                        });

                        describe('when the resource is unpublished', () => {
                            it('should be found', async () => {
                                const resourceToFind = confidentialResources[0];

                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(resourceToFind.id)
                                );

                                assertDetailOkResponse(res, resourceToFind);
                            });
                        });
                    });
                });
            });

            describe('when the user is not authenticated (public request)', () => {
                beforeAll(async () => {
                    ({ app, testRepositoryProvider } = await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                            BASE_DIGITAL_ASSET_URL,
                        }
                        // no test user will be on the request
                    ));
                });

                beforeEach(async () => {
                    await testRepositoryProvider.testSetup();

                    await testRepositoryProvider.addFullSnapshot(
                        buildInMemorySnapshot({
                            resources: {
                                [resourceType]: allResourcesOfCurrentType,
                            },
                        })
                    );
                });

                afterEach(async () => {
                    // await testRepositoryProvider.testTeardown();
                    // await arangoConnectionProvider.dropDatabaseIfExists();
                    // await app.close();
                });

                describe('when querying for many resources (fetch many)', () => {
                    it('should return only public results', async () => {
                        const res = await request(app.getHttpServer()).get(indexEndpoint);

                        assertOkResponse(res, publicResources);
                    });
                });

                describe('when querying for a single resource by ID (fetch by ID)', () => {
                    describe('when the resource is published', () => {
                        it('should be found', async () => {
                            const resourceToFind = publicResources[0];

                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(resourceToFind.id)
                            );

                            assertDetailOkResponse(res, resourceToFind);
                        });
                    });

                    describe('when the resource is unpublished', () => {
                        it('should not be found', async () => {
                            const resourceToFind = confidentialResources[0];

                            await request(app.getHttpServer())
                                .get(buildDetailEndpoint(resourceToFind.id))
                                .expect(httpStatusCodes.notFound);
                        });
                    });
                });
            });
        });
    });
});
