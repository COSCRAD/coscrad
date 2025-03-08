import {
    AggregateType,
    CoscradUserRole,
    IDetailQueryResult,
    IPhotographViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandInfoService } from '../../../../app/controllers/command/services/command-info-service';
import getValidAggregateInstanceForTest from '../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { clonePlainObjectWithOverrides } from '../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { BaseResourceViewModel } from '../../../../queries/buildViewModelForResource/viewModels/base-resource.view-model';
import buildTestDataInFlatFormat from '../../../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../../../test-data/events';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../../photograph';
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

const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

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

const testPhotographer = 'Jeff Thomas';

const photograghHeightPx = 600;

const photograghWidthPx = 1200;

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const photographCreated = new TestEventStream().andThen<PhotographCreated>({
    type: 'PHOTOGRAPH_CREATED',
    payload: {
        title: photographTitle,
        languageCodeForTitle: languageCodeForTitle,
        mediaItemId: existingMediaItem.id,
        photographer: testPhotographer,
        heightPx: photograghHeightPx,
        widthPx: photograghWidthPx,
    },
    meta: {
        contributorIds: [dummyContributor.id],
    },
});

const dummyPhotograph = PhotographViewModel.fromPhotographCreated(
    photographCreated.as(photographCompositeId)[0] as PhotographCreated
);

const targetPhotographView = clonePlainObjectWithOverrides(dummyPhotograph, {
    isPublished: true,
    contributions: [
        {
            id: dummyContributor.id,
            fullName: dummyContributor.fullName.toString(),
        },
    ],
});

const privatePhotographThatUserCanAccess = clonePlainObjectWithOverrides(dummyPhotograph, {
    accessControlList: new AccessControlList({
        allowedUserIds: [dummyQueryUserId],
        allowedGroupIds: [],
    }),
    isPublished: false,
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
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: new CoscradUserWithGroups(
                            dummyUser.clone({
                                roles: [CoscradUserRole.superAdmin],
                            }),
                            []
                        ),
                    }
                ));

                const _commandInfoService = app.get(CommandInfoService);

                const _foo = app.get(CommandHandlerService);

                photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);
            });

            describe(`when there is a photograph with the given Id`, () => {
                describe(`when the photograph is published`, () => {
                    beforeEach(async () => {
                        await photographQueryRepository.createMany([targetPhotographView]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(photographId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when the photograph is not published`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history

                        // TODO: we need to check that contributors come through

                        await photographQueryRepository.createMany([
                            clonePlainObjectWithOverrides(targetPhotographView, {
                                isPublished: false,
                            }),
                        ]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(photographId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when the photograph is not published but the user has explicit access`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history

                        // TODO: we need to check that contributors come through

                        await photographQueryRepository.createMany([
                            privatePhotographThatUserCanAccess,
                        ]);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(photographId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);

                        // Commands should be visible to admin
                        expect(res.body.actions).not.toEqual([]);
                    });
                });

                describe(`when there is no photograph with the given Id`, () => {
                    it(`should return not found (404)`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(buildDummyUuid(456))
                        );

                        expect(res.status).toBe(httpStatusCodes.notFound);
                    });
                });
            });

            // Re-write `when the user is a project admin` from vocabulary list
            describe(`when the user is a project admin`, () => {
                beforeAll(async () => {
                    ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                        {
                            ARANGO_DB_NAME: testDatabaseName,
                        },
                        {
                            testUserWithGroups: new CoscradUserWithGroups(
                                dummyUser.clone({
                                    roles: [CoscradUserRole.projectAdmin],
                                }),
                                []
                            ),
                        }
                    ));
                });

                describe(`when there is a photograph with the given Id`, () => {
                    describe(`when the photograph is published`, () => {
                        beforeEach(async () => {
                            // TODO: we need to check that contributors come through

                            await photographQueryRepository.createMany([targetPhotographView]);
                        });

                        it(`should return the expected result`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(photographId)
                            );

                            expect(res.status).toBe(httpStatusCodes.ok);

                            const photograph = res.body as IDetailQueryResult<IPhotographViewModel>;

                            const { actions } = photograph;

                            // admin should see commands
                            expect(actions).not.toHaveLength(0);

                            /**
                             * TODO: build a media url given the media item id based on `buildAudioUrl` in term query service
                             */

                            /**
                             * TODO We should add a separate test that checks
                             * that the correct actions come through in different
                             * scenarios.
                             */
                            expect(actions).toMatchSnapshot();
                        });
                    });

                    describe(`when the photograph is not published`, () => {
                        beforeEach(async () => {
                            await photographQueryRepository.createMany([
                                clonePlainObjectWithOverrides(targetPhotographView, {
                                    isPublished: false,
                                }),
                            ]);
                        });

                        it(`should return the expected result`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(photographId)
                            );

                            expect(res.status).toBe(httpStatusCodes.ok);

                            // Commands should be visible to admin
                            expect(res.body.actions).not.toEqual([]);
                        });
                    });

                    describe(`when the photograph is not published but the user has explicit access`, () => {
                        /**
                         * Currently, a project admin has access to all resources.
                         * In the future, this may not be the case. Nonetheless, a
                         * project admin will always have access to a resource for
                         * which their name appears in the query ACL.
                         */
                        beforeEach(async () => {
                            await photographQueryRepository.createMany([
                                privatePhotographThatUserCanAccess,
                            ]);
                        });

                        it(`should return the expected result`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(photographId)
                            );

                            expect(res.status).toBe(httpStatusCodes.ok);

                            // Commands should be visible to admin
                            expect(res.body.actions).not.toEqual([]);
                        });
                    });

                    describe(`when there is no photograph with the given Id`, () => {
                        it(`should return not found (404)`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(buildDummyUuid(456))
                            );

                            expect(res.status).toBe(httpStatusCodes.notFound);
                        });
                    });
                });

                describe(`when the user is an ordinary authenticated user`, () => {
                    beforeAll(async () => {
                        ({ app, testRepositoryProvider, databaseProvider } =
                            await setUpIntegrationTest(
                                {
                                    ARANGO_DB_NAME: testDatabaseName,
                                },
                                {
                                    testUserWithGroups: dummyUserWithGroups,
                                }
                            ));
                    });

                    describe(`when there is a photograph with the given Id`, () => {
                        describe(`when the photograph is published`, () => {
                            beforeEach(async () => {
                                await photographQueryRepository.createMany([targetPhotographView]);
                            });

                            it(`should return the expected result`, async () => {
                                const res = await request(app.getHttpServer()).get(
                                    buildDetailEndpoint(photographId)
                                );

                                expect(res.status).toBe(httpStatusCodes.ok);

                                // We don't expose actions to non-admin users
                                expect(res.body.actions).toEqual([]);
                            });
                        });
                    });

                    describe(`when the photograph is not published and the user does not have access`, () => {
                        beforeEach(async () => {
                            await photographQueryRepository.createMany([
                                clonePlainObjectWithOverrides(targetPhotographView, {
                                    isPublished: false,
                                    // no special access here
                                    accessControlList: new AccessControlList(),
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

                    describe(`when the photograph is not published but the user has access`, () => {
                        beforeEach(async () => {
                            await photographQueryRepository.createMany([
                                privatePhotographThatUserCanAccess,
                            ]);
                        });

                        it(`should return the expected result`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(photographId)
                            );

                            expect(res.status).toBe(httpStatusCodes.ok);

                            // We don't expose actions to non-admin users
                            expect(res.body.actions).toEqual([]);
                        });
                    });

                    describe(`when there is no photograph with the given Id`, () => {
                        it(`should return not found (404)`, async () => {
                            const res = await request(app.getHttpServer()).get(
                                buildDetailEndpoint(buildDummyUuid(458))
                            );

                            expect(res.status).toBe(httpStatusCodes.notFound);
                        });
                    });
                });
            });
        });
    });
});
