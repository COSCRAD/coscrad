import {
    AggregateType,
    CoscradUserRole,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { ICoscradEvent, ICoscradEventHandler } from '../../domain/common';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourceReadAccessGrantedToUserEventHandler } from '../../domain/models/shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { ResourcePublishedEventHandler } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { TermCreated, TermTranslated } from '../../domain/models/term/commands';
import { AudioAddedForTermEventHandler } from '../../domain/models/term/commands/add-audio-for-term/audio-added-for-term.event-handler';
import { TermCreatedEventHandler } from '../../domain/models/term/commands/create-term/term-created.event-handler';
import { TermTranslatedEventHandler } from '../../domain/models/term/commands/translate-term/term-translated.event-handler';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/term/queries';
import { CoscradContributor } from '../../domain/models/user-management/contributor';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { FullName } from '../../domain/models/user-management/user/entities/user/full-name.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { InternalError } from '../../lib/errors/InternalError';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { DynamicDataTypeFinderService } from '../../validation';
import { TermViewModel } from '../buildViewModelForResource/viewModels';
import { BaseResourceViewModel } from '../buildViewModelForResource/viewModels/base-resource.view-model';

// Set up endpoints: index endpoint, id endpoint
const indexEndpoint = `/resources/terms`;

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
const termText = `Term (in the language)`;

const originalLanguage = LanguageCode.Haida;

const termTranslation = `Term (in English)`;

const translationLanguage = LanguageCode.English;

const termId = buildDummyUuid(1);

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

const privateTermThatUserCanAccess = termTranslated.andThen<ResourceReadAccessGrantedToUser>({
    type: 'RESOURCE_READ_ACCESS_GRANTED_TO_USER',
    payload: {
        userId: dummyQueryUserId,
    },
});

const termPublished = termTranslated.andThen<ResourcePublished>({
    type: 'RESOURCE_PUBLISHED',
});

// TODO Add happy path cases for a prompt term
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

/**
 * TODO We need to find a more maintainable way of
 * seeding the required initial state.
 */
const buildEventHandlers = (termQueryRepository: ITermQueryRepository) => [
    new TermCreatedEventHandler(termQueryRepository),
    new TermTranslatedEventHandler(termQueryRepository),
    new AudioAddedForTermEventHandler(termQueryRepository),
    // TODO update this to take in a generic query repository provider
    new ResourceReadAccessGrantedToUserEventHandler(termQueryRepository),
    new ResourcePublishedEventHandler({
        // TODO break this out into an ArangoQueryRepositoryProvider
        forResource(resourceType: ResourceType) {
            if (resourceType === ResourceType.term) {
                return termQueryRepository;
            }

            throw new InternalError(
                `Resource Type: ${resourceType} is not supported by the query repository provider`
            );
        },
    }),
];

describe(`when querying for a term: fetch by Id`, () => {
    const testDatabaseName = generateDatabaseNameForTestSuite();

    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let termQueryRepository: ITermQueryRepository;

    let handlers: ICoscradEventHandler[];

    let seedTerms: (eventHistory: ICoscradEvent[]) => Promise<void>;

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();
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

            termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

            await app.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

            handlers = buildEventHandlers(termQueryRepository);

            seedTerms = async (events: ICoscradEvent[]) => {
                for (const e of events) {
                    for (const h of handlers) {
                        await h.handle(e);
                    }
                }
            };
        });

        describe(`when there is a term with the given Id`, () => {
            describe(`when a term is published`, () => {
                beforeEach(async () => {
                    const eventHistoryForTerm = termPublished.as({
                        type: AggregateType.term,
                        id: termId,
                    });
                    // TODO: we need to check that contributors come through

                    await seedTerms(eventHistoryForTerm);

                    await testRepositoryProvider
                        .getContributorRepository()
                        .create(dummyContributor);
                });

                /**
                 * TODO We need a contract test that will warn us if we potentially
                 * break the client via breaking chagnes to the API.
                 */
                it('should return the expected result', async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    expect(res.status).toBe(httpStatusCodes.ok);

                    const result = res.body as TermViewModel;

                    expect(result.id).toBe(termId);

                    assertResourceHasContributionFor(dummyContributor, result);
                });
            });

            describe(`when a term is not published`, () => {
                beforeEach(async () => {
                    // note that there is no publication event in this event history
                    const eventHistoryForTerm = termTranslated.as({
                        type: AggregateType.term,
                        id: termId,
                    });
                    // TODO: we need to check that contributors come through

                    await seedTerms(eventHistoryForTerm);
                });

                // We pretend the resource does not exist when the user
                // does not have access to this term
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    const _foo = res.body;

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

        describe(`when there is no term with the given Id`, () => {
            it(`should return not found (404)`, async () => {
                const res = await request(app.getHttpServer()).get(
                    buildDetailEndpoint(buildDummyUuid(456))
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

                termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

                /**
                 * TODO We need to find a more maintainable way of
                 * seeding the required initial state.
                 */
                handlers = buildEventHandlers(termQueryRepository);

                seedTerms = async (events: ICoscradEvent[]) => {
                    for (const e of events) {
                        for (const h of handlers) {
                            await h.handle(e);
                        }
                    }
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });

                        // TODO: we need to check that contributors come through
                        await seedTerms(eventHistoryForTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });

                describe(`when the term is not published`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForTerm = termTranslated.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });

                describe(`when the term is not published but the user has explicit access`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForPrivateTerm = privateTermThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForPrivateTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });

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

                termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

                /**
                 * TODO We need to find a more maintainable way of
                 * seeding the required initial state.
                 */
                handlers = buildEventHandlers(termQueryRepository);

                seedTerms = async (events: ICoscradEvent[]) => {
                    for (const e of events) {
                        for (const h of handlers) {
                            await h.handle(e);
                        }
                    }
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });

                describe(`when the term is not published`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForTerm = termTranslated.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });

                describe(`when the term is not published but the user has explicit access`, () => {
                    // This case is a bit unclear: does this project admin have access to
                    // the project this term is a part of?
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForPrivateTerm = privateTermThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForPrivateTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
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
                ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                    {
                        ARANGO_DB_NAME: testDatabaseName,
                    },
                    {
                        testUserWithGroups: dummyUserWithGroups,
                    }
                ));

                termQueryRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

                /**
                 * TODO We need to find a more maintainable way of
                 * seeding the required initial state.
                 */
                handlers = buildEventHandlers(termQueryRepository);

                seedTerms = async (events: ICoscradEvent[]) => {
                    for (const e of events) {
                        for (const h of handlers) {
                            await h.handle(e);
                        }
                    }
                };
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });

                describe(`when the term is not published and the user does not have access`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForTerm = termTranslated.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForTerm);
                    });

                    // We pretend the resource does not exist when the user
                    // does not have access to this term
                    it(`should return not found (404)`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.notFound);
                    });
                });

                describe(`when the term is not published but the user has access`, () => {
                    beforeEach(async () => {
                        // note that there is no publication event in this event history
                        const eventHistoryForPrivateTerm = privateTermThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await seedTerms(eventHistoryForPrivateTerm);
                    });

                    it(`should return the expected result`, async () => {
                        const res = await request(app.getHttpServer()).get(
                            buildDetailEndpoint(termId)
                        );

                        expect(res.status).toBe(httpStatusCodes.ok);
                    });
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(
                        buildDetailEndpoint(buildDummyUuid(456))
                    );

                    expect(res.status).toBe(httpStatusCodes.notFound);
                });
            });
        });
    });
});
