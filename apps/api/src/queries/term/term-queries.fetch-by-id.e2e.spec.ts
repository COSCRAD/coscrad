import { AggregateType, CoscradUserRole, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ResourceReadAccessGrantedToUser } from '../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TermCreated, TermTranslated } from '../../domain/models/term/commands';
import { CoscradUserGroup } from '../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUserWithGroups } from '../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import buildTestDataInFlatFormat from '../../test-data/buildTestDataInFlatFormat';
import { TestEventStream } from '../../test-data/events';
import { DynamicDataTypeFinderService } from '../../validation';

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

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: termText,
        languageCode: originalLanguage,
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

describe(`when querying for a term: fetch by Id`, () => {
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

    describe(`when the user is unauthenticated`, () => {
        beforeAll(async () => {
            ({ app, testRepositoryProvider, databaseProvider } = await setUpIntegrationTest(
                {
                    ARANGO_DB_NAME: testDatabaseName,
                }
                // no authenticated user
            ));

            await app.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();
        });

        describe(`when there is a term with the given Id`, () => {
            describe(`when a term is published`, () => {
                beforeEach(async () => {
                    const eventHistoryForTerm = termPublished.as({
                        type: AggregateType.term,
                        id: termId,
                    });
                    // TODO: we need to check that contributors come through

                    await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
                });

                it('should return the expected result', async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    expect(res.status).toBe(httpStatusCodes.ok);

                    // TODO: Check the state of the response in detail
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

                    await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
                });

                // We pretend the resource does not exist when the user
                // does not have access to this term
                it(`should return not found (404)`, async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

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
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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
                        const eventHistoryForPrivateTerm = termPrivateThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(eventHistoryForPrivateTerm);
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
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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
                        const eventHistoryForPrivateTerm = termPrivateThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(eventHistoryForPrivateTerm);
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
            });

            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    beforeEach(async () => {
                        const eventHistoryForTerm = termPublished.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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

                        await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);
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
                        const eventHistoryForPrivateTerm = termPrivateThatUserCanAccess.as({
                            type: AggregateType.term,
                            id: termId,
                        });
                        // TODO: we need to check that contributors come through

                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(eventHistoryForPrivateTerm);
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
