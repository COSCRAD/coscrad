import {
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../domain/models/shared/access-control/access-control-list.entity';
import { TermCreated } from '../../domain/models/term/commands';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/term/queries';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { clonePlainObjectWithOverrides } from '../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoCollectionId } from '../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { TermViewModel } from '../buildViewModelForResource/viewModels/term.view-model';

const indexEndpoint = `/resources/terms`;

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
const termText = `Term (in the language)`;

const originalLanguage = LanguageCode.Haida;

const termTranslation = `Term (in English)`;

const translationLanguage = LanguageCode.English;

const termId = buildDummyUuid(101);

const termCompositeIdentifier = {
    type: AggregateType.term,
    id: termId,
};

const termIdUnpublishedNoUserAccessId = buildDummyUuid(102);

const termIdUnpublishedWithUserAccessId = buildDummyUuid(103);

const dummyContributorFirstName = 'Dumb';

const dummyContributorLastName = 'McContributor';

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor).clone({
    fullName: new FullName({
        firstName: dummyContributorFirstName,
        lastName: dummyContributorLastName,
    }),
});

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: termText,
        languageCode: originalLanguage,
    },
    meta: {
        // we also want to check that the contributions come through
        contributorIds: [dummyContributor.id],
    },
});

const dummyTermView = clonePlainObjectWithOverrides(
    TermViewModel.fromTermCreated(termCreated.as(termCompositeIdentifier)[0] as TermCreated),
    {
        contributions: [
            {
                id: dummyContributor.id,
                fullName: dummyContributor.fullName.toString(),
            },
        ],
    }
);

const publicTermView = clonePlainObjectWithOverrides(dummyTermView, {
    isPublished: true,
    name: new MultilingualText(dummyTermView.name).translate({
        text: termTranslation,
        languageCode: translationLanguage,
        role: MultilingualTextItemRole.freeTranslation,
        // we are insisting by casting that the call to `translate` won't fail above
    }) as MultilingualText,
});

const privateTermThatUserCanAccess = clonePlainObjectWithOverrides(publicTermView, {
    id: termIdUnpublishedWithUserAccessId,
    isPublished: false,
    accessControlList: new AccessControlList().allowUser(dummyQueryUserId),
});

const privateTermUserCannotAccess = clonePlainObjectWithOverrides(publicTermView, {
    id: termIdUnpublishedNoUserAccessId,
    isPublished: false,
    // no special access
    accessControlList: new AccessControlList(),
});

// const promptTermId = buildDummyUuid(2)

describe(`when querying for a term: fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let termQueryRepository: ITermQueryRepository;

    let seedTerms: (terms: TermViewModel[]) => Promise<void>;

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

            await app.init();

            termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

            seedTerms = async (terms: TermViewModel[]) => {
                await termQueryRepository.createMany(terms);
            };
        });

        describe(`when there is a published term in the index view`, () => {
            beforeEach(async () => {
                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);

                await seedTerms([
                    publicTermView,
                    privateTermThatUserCanAccess,
                    privateTermUserCannotAccess,
                ]);
            });

            it(`should only return published terms`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                const {
                    body: { entities },
                } = res;

                // TODO check that the actions are correct !!!!!
                expect(entities).toHaveLength(1);

                // Only one published result should come through from eventHistoryForMany
                const result = entities[0] as TermViewModel;

                expect(result.id).toBe(termId);

                const _knownContributors = await testRepositoryProvider
                    .getContributorRepository()
                    .fetchMany();

                expect(
                    result.contributions.some(({ fullName, id: foundContributorId }) => {
                        return (
                            // TODO we will want a test helper for this comparison in case we decide to change format
                            fullName ===
                                `${dummyContributorFirstName} ${dummyContributorLastName}` &&
                            foundContributorId === dummyContributor.id
                        );
                    })
                ).toBe(true);
            });
        });

        describe(`when there are no published terms`, () => {
            beforeEach(async () => {
                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);

                /**
                 * Note that there is no ordinary system user authenticated for the request
                 * in this scenario. This is a public request.
                 */
                await seedTerms([privateTermUserCannotAccess, privateTermThatUserCanAccess]);
            });

            it(`should return no terms`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                expect(res.body.entities).toHaveLength(0);
            });
        });
    });

    describe(`when the user is authenticated as a non-admin user`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                },
                {
                    testUserWithGroups: dummyUserWithGroups,
                }
            ));

            termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

            seedTerms = async (terms: TermViewModel[]) => {
                await termQueryRepository.createMany(terms);
            };
        });

        describe(`when there is a term that is unpublished`, () => {
            describe(`when the user does not have read access`, () => {
                beforeEach(async () => {
                    await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

                    await databaseProvider
                        .getDatabaseForCollection(ArangoCollectionId.contributors)
                        .clear();

                    await seedTerms([
                        publicTermView,
                        privateTermThatUserCanAccess,
                        // This one should not be visible to an ordinary user
                        privateTermUserCannotAccess,
                    ]);

                    await testRepositoryProvider
                        .getContributorRepository()
                        .create(dummyContributor);
                });

                it(`should not return the unpublished term`, async () => {
                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    expect(res.status).toBe(httpStatusCodes.ok);

                    /**
                     * + private, but user in ACL
                     * - private, user not in ACL
                     * + published
                     */
                    expect(res.body.entities).toHaveLength(2);
                });
            });

            describe(`when the user does have read access`, () => {
                beforeEach(async () => {
                    await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

                    await databaseProvider
                        .getDatabaseForCollection(ArangoCollectionId.contributors)
                        .clear();

                    await seedTerms([
                        // we only seed the accessible term here
                        privateTermThatUserCanAccess,
                    ]);

                    await testRepositoryProvider
                        .getContributorRepository()
                        .create(dummyContributor);
                });

                it(`should return the unpublished term`, async () => {
                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    expect(res.status).toBe(httpStatusCodes.ok);

                    const {
                        body: { entities },
                    } = res;

                    // this is the first and only term we seeded
                    const result = entities[0] as TermViewModel;

                    expect(result.id).toBe(termIdUnpublishedWithUserAccessId);
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
            beforeAll(async () => {
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: new CoscradUserWithGroups(
                            dummyUser.clone({
                                roles: [userRole],
                            }),
                            []
                        ),
                    }
                ));

                termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

                seedTerms = async (terms: TermViewModel[]) => {
                    await termQueryRepository.createMany(terms);
                };
            });

            beforeEach(async () => {
                await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

                await databaseProvider
                    .getDatabaseForCollection(ArangoCollectionId.contributors)
                    .clear();

                await seedTerms([
                    publicTermView,
                    privateTermThatUserCanAccess,
                    privateTermUserCannotAccess,
                ]);

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);
            });

            it(`should allow the user to access private resources`, async () => {
                const res = await request(app.getHttpServer()).get(indexEndpoint);

                const numberOfPrivateTerms = 2;

                const numberOfPublicTerms = 1;

                expect(res.status).toBe(HttpStatusCode.ok);

                expect(res.body.entities).toHaveLength(numberOfPrivateTerms + numberOfPublicTerms);

                /**
                 * This if statement is effectively a filter for our test
                 * case builder pattern. We only want to snapshot the response
                 * once for one specific class of user. We want this to be
                 * an admin user, because admin users have access to all
                 * data, including command info (available actions).
                 * Finally, we do this for the project admin, as queries
                 * for this user are by far more common than for coscrad admin
                 * in practice.
                 */
                if (userRole === CoscradUserRole.projectAdmin) {
                    /**
                     * This is to catch breaking changes in the API contract with
                     * the client. See the above comment for the corresponding detail
                     * endpoint test case.
                     */
                    expect(res.body).toMatchSnapshot();
                }
            });
        });
    });
});
