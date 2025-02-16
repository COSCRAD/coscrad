import {
    AggregateType,
    CoscradUserRole,
    IDetailQueryResult,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { PhotographCreated } from '../../domain/models/photograph';
import {
    IPhotographQueryRepository,
    PHOTOGRAPH_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/photograph/queries';
import { CoscradContributor } from '../../domain/models/user-management/contributor';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { BaseResourceViewModel } from '../buildViewModelForResource/viewModels/base-resource.view-model';
import { PhotographViewModel } from '../buildViewModelForResource/viewModels/photograph.view-model';

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

// const dummyGroup = (userGroups as CoscradUserGroup[])[0].clone({ userIds: [dummyUser.id] });

// const dummyUserWithGroups = new CoscradUserWithGroups(dummyUser, [dummyGroup]);

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

// const privatePhotographThatUserCanAccess = clonePlainObjectWithOverrides(dummyPhotograph, {
//     accessControlList: new AccessControlList({
//         allowedUserIds: [dummyQueryUserId],
//         allowedGroupIds: [],
//     }),
//     isPublished: false,
// });

// TODO Add happy path cases for a prompt photograph
// const promptTermId = buildDummyUuid(2)

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

    let seedPhotographs: (photographs: PhotographViewModel[]) => Promise<void>;

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

            // eventPublisher = app.get(EVENT_PUBLISHER_TOKEN);

            photographQueryRepository = app.get(PHOTOGRAPH_QUERY_REPOSITORY_TOKEN);

            /**
             * We need to use the proper publisher to make sure events only
             * run if they match the pattern for the given handler.
             */
            seedPhotographs = async (photographs: PhotographViewModel[]) => {
                await photographQueryRepository.createMany(photographs);
            };
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

                    await seedPhotographs([targetPhotographView]);
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
                    await seedPhotographs([
                        clonePlainObjectWithOverrides(targetPhotographView, {
                            isPublished: false,
                        }),
                    ]);
                });

                // We pretend the resource does not exist when the user
                // does not have access to this term
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

                seedPhotographs = async (photographs: PhotographViewModel[]) => {
                    await photographQueryRepository.createMany(photographs);
                };
            });

            describe(`when there is a photograph with the given Id`, () => {
                describe(`when the photograph is published`, () => {
                    beforeEach(async () => {
                        await seedPhotographs([targetPhotographView]);
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

                        await seedPhotographs([
                            clonePlainObjectWithOverrides(targetPhotographView, {
                                isPublished: false,
                            }),
                        ]);
                    });
                });
            });
        });
    });
});
