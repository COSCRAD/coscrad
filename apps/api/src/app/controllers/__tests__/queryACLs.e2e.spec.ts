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

describe('Access Control List and Role Based filtering in resource queries', () => {
    let app: INestApplication;

    // let arangoConnectionProvider: ArangoConnectionProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        ({ app, testRepositoryProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
                BASE_DIGITAL_ASSET_URL: 'https://www.mysound.org/downloads/',
            },
            {
                testUserWithGroups: dummyUserWithGroups,
            }
        ));
    });

    Object.values(ResourceType)
        .filter((resourceType) => resourceType === ResourceType.book)
        .forEach((resourceType) => {
            describe(`when querying for ${formatAggregateType(resourceType)}`, () => {
                const endpointUnderTest = `/${buildViewModelPathForResourceType(resourceType)}`;

                describe('when the user is authenticated, and not a project or COSCRAD admin', () => {
                    beforeEach(async () => {
                        await testRepositoryProvider.testSetup();
                    });

                    afterEach(async () => {
                        // await testRepositoryProvider.testTeardown();
                        // await arangoConnectionProvider.dropDatabaseIfExists();
                        // await app.close();
                    });

                    const unpublishedResourceWithUserInACL = getValidResourceInstanceForTest(
                        resourceType
                    ).clone({
                        published: false,
                        queryAccessControlList: new AccessControlList().allowUser(
                            dummyUserWithGroups.id
                        ),
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
                                id: `PUBLISHED-${(
                                    index + numberOfPrivateResourcesToFind
                                ).toString()}`,
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

                    it('should find unpublished resources when the user is in the ACL', async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            buildInMemorySnapshot({
                                users: [dummyUser],
                                userGroups: [dummyGroup],
                                resources: {
                                    [resourceType]: [
                                        ...privateResourcesTheUserCanQuery,
                                        ...publicResources,
                                        ...confidentialResources,
                                    ],
                                },
                            })
                        );

                        const resourcesThatShouldBeFound = [
                            ...publicResources,
                            ...privateResourcesTheUserCanQuery,
                        ];

                        const res = await request(app.getHttpServer()).get(
                            `/resources${endpointUnderTest}`
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        const viewModels = res.body.data.map((result) => result.data);

                        expect(viewModels.every((viewModel) => viewModel instanceof BaseViewModel));

                        // TODO move this to the functional lib and use it everywhere
                        const getId = ({ id }: HasAggregateId): AggregateId => id;

                        const allFoundViewModelIds = viewModels.map(getId).sort();

                        expect(allFoundViewModelIds).toEqual(
                            resourcesThatShouldBeFound.map(getId).sort()
                        );

                        expect(viewModels).toMatchSnapshot();
                    });
                });
            });
        });
});
