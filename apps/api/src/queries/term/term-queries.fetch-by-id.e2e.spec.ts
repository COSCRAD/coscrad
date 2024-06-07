import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import httpStatusCodes from '../../app/constants/httpStatusCodes';
import setUpIntegrationTest from '../../app/controllers/__tests__/setUpIntegrationTest';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { TermCreated, TermTranslated } from '../../domain/models/term/commands';
import { Term } from '../../domain/models/term/entities/term.entity';
import { AggregateId } from '../../domain/types/AggregateId';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import TestRepositoryProvider from '../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../persistence/repositories/arango-event-repository';
import { TestEventStream } from '../../test-data/events';
import { DynamicDataTypeFinderService } from '../../validation';

// Set up endpoints: index endpoint, id endpoint
const indexEndpoint = `/resources/terms`;

const buildDetailEndpoint = (id: AggregateId) => `${indexEndpoint}/${id}`;

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
                    const eventHistoryForTerm = termTranslated.as({
                        type: AggregateType.term,
                        id: termId,
                    });
                    // TODO: we need to check that contributors come through

                    await app.get(ArangoEventRepository).appendEvents(eventHistoryForTerm);

                    const term = Term.fromEventHistory(eventHistoryForTerm, termId) as Term;

                    await testRepositoryProvider.forResource(ResourceType.term).create(term);
                });

                it('should return the expected result', async () => {
                    const res = await request(app.getHttpServer()).get(buildDetailEndpoint(termId));

                    expect(res.status).toBe(httpStatusCodes.ok);

                    // TODO: Check the state of the response in detail
                });
            });

            describe(`when a term is unpublished`, () => {
                // We pretend the resource does not exist when the user
                // does not have access to this term
                it.todo(`should return not found (404)`);
            });
        });

        describe(`when there is no term with the given Id`, () => {
            it.todo(`should return not found (404)`);
        });
    });

    describe(`when the user is authenticated`, () => {
        describe(`when the user is a coscrad admin`, () => {
            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is not published`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is unpublished but and the user has explicit access`, () => {
                    it.todo(`should return the expected result`);
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it.todo(`should return not found (404)`);
            });
        });

        describe(`when the user is a project admin`, () => {
            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is not published`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is unpublished but and the user has explicit access`, () => {
                    it.todo(`should return the expected result`);
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it.todo(`should return not found (404)`);
            });
        });

        describe(`when the user is an ordinary authenticated user`, () => {
            describe(`when there is a term with the given Id`, () => {
                describe(`when the term is published`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is not published and the user does not have access`, () => {
                    it.todo(`should return the expected result`);
                });

                describe(`when the term is unpublished but the user has access`, () => {
                    it.todo(`should return the expected result`);
                });
            });

            describe(`when there is no term with the given Id`, () => {
                it.todo(`should return not found (404)`);
            });
        });
    });
});
