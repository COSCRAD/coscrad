import {
    AggregateType,
    CoscradUserRole,
    HttpStatusCode,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TermCreated, TermTranslated } from '../../domain/models/term/commands';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { TermViewModel } from '../buildViewModelForResource/viewModels';

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

const termTranslated = termCreated.andThen<TermTranslated>({
    type: 'TERM_TRANSLATED',
    payload: {
        translation: termTranslation,
        languageCode: translationLanguage,
    },
});

const termPrivateThatUserCanAccess = termTranslated.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId: dummyQueryUserId,
    },
});

const termPublished = termTranslated.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

// const promptTermId = buildDummyUuid(2)

describe(`when querying for a term: fetch many`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    const eventHistoryForManyUnpublished = [
        ...termTranslated.as({ id: termIdUnpublishedNoUserAccessId, type: AggregateType.term }),
        ...termPrivateThatUserCanAccess.as({
            id: termIdUnpublishedWithUserAccessId,
            type: AggregateType.term,
        }),
    ];

    const eventHistoryForManyWithPublishedTerm = [
        ...eventHistoryForManyUnpublished,
        ...termPublished.as({ id: termId, type: AggregateType.term }),
    ];

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            await app.init();
        });

        describe(`when there is a published term in the index view`, () => {
            it(`should only return published terms`, async () => {
                await app
                    .get(ArangoEventRepository)
                    .appendEvents(eventHistoryForManyWithPublishedTerm);

                await testRepositoryProvider.getContributorRepository().create(dummyContributor);

                const res = await request(app.getHttpServer()).get(indexEndpoint);

                expect(res.status).toBe(httpStatusCodes.ok);

                const {
                    body: { entities },
                } = res;

                expect(entities).toHaveLength(1);

                // Only one published result should come through from eventHistoryForMany
                const result = entities[0] as TermViewModel;

                expect(result.id).toBe(termId);

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
            it(`should return no terms`, async () => {
                await app.get(ArangoEventRepository).appendEvents(eventHistoryForManyUnpublished);

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
        });

        describe(`when there is a term that is unpublished`, () => {
            describe(`when the user does not have read access`, () => {
                it(`should not return the unpublished term`, async () => {
                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(eventHistoryForManyWithPublishedTerm);

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
                it(`should return the unpublished term`, async () => {
                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(eventHistoryForManyWithPublishedTerm);

                    const res = await request(app.getHttpServer()).get(indexEndpoint);

                    expect(res.status).toBe(httpStatusCodes.ok);

                    /**
                     * + published
                     * + private, but user in ACL
                     * - private, user not in ACL
                     */

                    const {
                        body: { entities },
                    } = res;

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
            });

            it(`should allow the user to access private resources`, async () => {
                await app.get(ArangoEventRepository).appendEvents(eventHistoryForManyUnpublished);

                const res = await request(app.getHttpServer()).get(indexEndpoint);

                const numberOfPrivateTerms = 2;

                expect(res.status).toBe(HttpStatusCode.ok);

                expect(res.body.entities).toHaveLength(numberOfPrivateTerms);

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