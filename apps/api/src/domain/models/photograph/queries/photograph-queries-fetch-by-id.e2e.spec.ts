import {
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    IDetailQueryResult,
    IPhotographViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { BaseResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-resource.view-model';
import buildTestDataInFlatFormat from '../../../../test-data/buildTestDataInFlatFormat';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../types/AggregateId';
import { assertQueryResult } from '../../__tests__';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../photograph/queries';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../user-management/contributor';
import { CoscradUserGroup } from '../../user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { PhotographViewModel } from './photograph.view-model';

// Set up endpoints: index endpoint, id endpoint
const indexEndpoint = `/resources/photographs`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

// We require an existing user for ACL tests
const dummyQueryUserId = buildDummyUuid(4);

const { user: users, userGroup: userGroups } = buildTestDataInFlatFormat();

const dummyUser = (users as CoscradUser[])[0].clone({
    authProviderUserId: `auth0|${dummyQueryUserId}`,
    id: dummyQueryUserId,
    roles: [CoscradUserRole.viewer],
});

const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

const _dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

// Set up test data (use event sourcing to set up state)
const photographTitle = `Photograph Title`;

const languageCodeForTitle = LanguageCode.Haida;

const photographId = buildDummyUuid(1);

const photographCompositeId = {
    type: AggregateType.photograph,
    id: photographId,
};

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    id: buildDummyUuid(55),
});

// const photograghHeightPx = 600;

// const photograghWidthPx = 1200;

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const dummyPhotograph = buildTestInstance(PhotographViewModel, {
    ...photographCompositeId,
    name: buildMultilingualTextWithSingleItem(photographTitle, languageCodeForTitle),
    mediaItemId: existingMediaItem.id,
    contributions: [
        {
            id: dummyContributor.id,
            fullName: dummyContributor.fullName.toString(),
        },
    ],
    // heightPx
    // widthPx
});

const targetPhotographView = clonePlainObjectWithOverrides(dummyPhotograph, {
    isPublished: true,
    contributions: [
        {
            id: dummyContributor.id,
            fullName: dummyContributor.fullName.toString(),
        },
    ],
});

const assertResourceHasContributionFor = (
    { id: contributorId }: CoscradContributor,
    resource: BaseResourceViewModel
) => {
    const hasContribution = resource.contributions.some(
        ({ id }) => id === contributorId
        // TODO support joining in contributors
        // && fullName === `${firstName} ${lastName}`
    );

    expect(hasContribution).toBe(true);
};

describe(`when querying for a photograph: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let photographQueryRepository: IPhotographQueryRepository;

    const setItUp = async (userWithGroups: CoscradUserWithGroups) => {
        ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: testDatabaseName,
                BASE_URL: 'https://www.photograph-queries-by-id.com',
                GLOBAL_PREFIX: 'myapi',
            },
            {
                testUserWithGroups: userWithGroups,
            }
        ));

        photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
    };

    // let eventPublisher: ICoscradEventPublisher;
    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
        });

        describe(`when there is a photograph with the given Id`, () => {
            describe(`when a photograph is published`, () => {
                beforeEach(async () => {
                    /**
                     * It is important that we do this before allowing the event
                     * handlers to run, as they will only add contributions
                     * if the corresponding contributor exists.
                     */
                    await testRepositoryProvider
                        .getContributorRepository()
                        .create(dummyContributor);

                    await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();

                    await photographQueryRepository.createMany([targetPhotographView]);
                });

                /**
                 * TODO We need a contract test that will warn us if we potentially
                 * break the client via breaking changes to the API.
                 */
                it('should return the expected result', async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(photographId)
                    );

                    expect(res.status).toBe(httpStatusCodes.ok);

                    const result = res.body as IDetailQueryResult<PhotographViewModel>;

                    expect(result.id).toBe(photographId);

                    // We don't expose actions to non-admin users
                    expect(result.actions).toEqual([]);

                    assertResourceHasContributionFor(dummyContributor, result);
                });
            });

            describe(`when a photograph is not published`, () => {
                beforeEach(async () => {
                    // note that there is no publication event in this event history

                    // TODO: we need to check that contributors come through
                    await photographQueryRepository.createMany([
                        clonePlainObjectWithOverrides(targetPhotographView, {
                            isPublished: false,
                        }),
                    ]);
                });

                // We pretend the resource does not exist when the user
                // does not have access to this photograph
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(photographId)
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when there is no photograph with the given Id`, () => {
            it(`should return not found (404)`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(467))
                );

                expect(res.status).toBe(httpStatusCodes.notFound);
            });
        });
    });

    describe(`when the user is authenticated`, () => {
        describe(`when the user is a coscrad admin`, () => {
            beforeAll(async () => {
                await setItUp(
                    new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [CoscradUserRole.superAdmin],
                        }),
                        []
                    )
                );

                photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
            });

            describe(`when there is a photograph with the given Id`, () => {
                describe(`when the photograph is published`, () => {
                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await photographQueryRepository.createMany([targetPhotographView]);
                            },
                            endpoint: buildDetailEndpoint(photographId),
                            expectedStatus: httpStatusCodes.ok,
                            checkResponseBody: async (
                                body: IDetailQueryResult<IPhotographViewModel>
                            ) => {
                                expect(body.actions).not.toEqual([]);
                            },
                        });
                    });
                });

                describe(`when the photograph is not published`, () => {
                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await photographQueryRepository.createMany([
                                    clonePlainObjectWithOverrides(targetPhotographView, {
                                        isPublished: false,
                                    }),
                                ]);
                            },
                            endpoint: buildDetailEndpoint(photographId),
                            // admin can see unpublished resources
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                body: IDetailQueryResult<IPhotographViewModel>
                            ) => {
                                expect(body.actions).not.toEqual([]);
                            },
                        });
                    });
                });
            });

            describe(`when there is no photograph with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            Promise.resolve();
                        },
                        endpoint: buildDetailEndpoint('missing123'),
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`when the user is a project admin`, () => {
            beforeAll(async () => {
                await setItUp(
                    new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [CoscradUserRole.projectAdmin],
                        }),
                        []
                    )
                );

                photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
            });

            describe(`when there is a photograph with the given Id`, () => {
                describe(`when the photograph is published`, () => {
                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await photographQueryRepository.createMany([targetPhotographView]);
                            },
                            endpoint: buildDetailEndpoint(photographId),
                            expectedStatus: httpStatusCodes.ok,
                            checkResponseBody: async (
                                body: IDetailQueryResult<IPhotographViewModel>
                            ) => {
                                expect(body.actions).not.toEqual([]);

                                /**
                                 * Note that we do this once and only once as
                                 * a contract test. We choose an admin case
                                 * because we want to capture the format of
                                 * the actions property as well.
                                 */
                                expect(body).toMatchSnapshot();
                            },
                        });
                    });
                });

                describe(`when the photograph is not published`, () => {
                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await photographQueryRepository.createMany([
                                    clonePlainObjectWithOverrides(targetPhotographView, {
                                        isPublished: false,
                                    }),
                                ]);
                            },
                            endpoint: buildDetailEndpoint(photographId),
                            // admin can see unpublished resources
                            expectedStatus: HttpStatusCode.ok,
                            checkResponseBody: async (
                                body: IDetailQueryResult<IPhotographViewModel>
                            ) => {
                                expect(body.actions).not.toEqual([]);
                            },
                        });
                    });
                });
            });

            describe(`when there is no photograph with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    await assertQueryResult({
                        app,
                        seedInitialState: async () => {
                            Promise.resolve();
                        },
                        endpoint: buildDetailEndpoint('missing123'),
                        expectedStatus: HttpStatusCode.notFound,
                    });
                });
            });
        });

        describe(`when the user is an ordinary viewer (non-admin)`, () => {
            beforeAll(async () => {
                await setItUp(
                    new CoscradUserWithGroups(
                        dummyUser.clone({
                            roles: [CoscradUserRole.viewer],
                        }),
                        []
                    )
                );

                photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
            });

            describe(`when there is a photograph with the given ID`, () => {
                describe(`when the photograph is published`, () => {
                    it(`should return the expected result`, async () => {
                        await assertQueryResult({
                            app,
                            seedInitialState: async () => {
                                await photographQueryRepository.createMany([targetPhotographView]);
                            },
                            endpoint: buildDetailEndpoint(photographId),
                            expectedStatus: httpStatusCodes.ok,
                            checkResponseBody: async (
                                body: IDetailQueryResult<IPhotographViewModel>
                            ) => {
                                // actions should not be visible to a non-admin user
                                expect(body.actions).toEqual([]);
                            },
                        });
                    });
                });

                describe(`when the photograph is not published`, () => {
                    describe(`when the user is not in the query ACL`, () => {
                        it(`should return the expected result`, async () => {
                            await assertQueryResult({
                                app,
                                seedInitialState: async () => {
                                    await photographQueryRepository.createMany([
                                        clonePlainObjectWithOverrides(targetPhotographView, {
                                            isPublished: false,
                                            // empty
                                            accessControlList: new AccessControlList(),
                                        }),
                                    ]);
                                },
                                endpoint: buildDetailEndpoint(photographId),
                                expectedStatus: HttpStatusCode.notFound,
                            });
                        });
                    });

                    describe(`when the user has access via the query ACL`, () => {
                        describe(`when the user is not in the query ACL`, () => {
                            it(`should return the expected result`, async () => {
                                await assertQueryResult({
                                    app,
                                    seedInitialState: async () => {
                                        await photographQueryRepository.createMany([
                                            clonePlainObjectWithOverrides(targetPhotographView, {
                                                isPublished: false,
                                                // empty
                                                accessControlList:
                                                    new AccessControlList().allowUser(dummyUser.id),
                                            }),
                                        ]);
                                    },
                                    endpoint: buildDetailEndpoint(photographId),
                                    expectedStatus: HttpStatusCode.ok,
                                    checkResponseBody: async (
                                        body: IDetailQueryResult<IPhotographViewModel>
                                    ) => {
                                        expect(body.actions).toEqual([]);
                                    },
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
