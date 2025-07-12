import { CoscradUserRole, HttpStatusCode, LanguageCode } from '@coscrad/api-interfaces';
import { Ack } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { DuplicateDigitalTextTitleError } from '../../errors';
import { CreateDigitalText } from '../create-digital-text.command';
import { TranslateDigitalTextTitle } from '../translate-digital-text-title';

const endpoint = '/commands/bulk';

const digitalTextId = buildDummyUuid(1);

const digitalTextTitle = 'A wondeful book!';

const languageCodeForTitle = LanguageCode.English;

const testAdminUser = buildTestInstance(CoscradUser, {
    id: buildDummyUuid(44),
    roles: [CoscradUserRole.projectAdmin],
});

const validCreateCommandFsa = {
    type: 'CREATE_DIGITAL_TEXT',
    payload: buildTestInstance(CreateDigitalText, {
        aggregateCompositeIdentifier: {
            id: digitalTextId,
        },
        title: digitalTextTitle,
        languageCodeForTitle,
    }),
    meta: {
        // shouldn't this come off the request?
        userId: testAdminUser.id,
    },
};

describe(`When creating a full digital text`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    // let idManager: IIdManager;

    // let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, app, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            },
            {
                testUserWithGroups: new CoscradUserWithGroups(testAdminUser, []),
            }
        ));

        // assertionHelperDependencies = {
        //     testRepositoryProvider,
        //     commandHandlerService,
        //     idManager,
        // };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the bulk command stream is valid`, () => {
        it(`should return the expected result`, async () => {
            const stream = [validCreateCommandFsa];

            const res = await request(app.getHttpServer()).post(endpoint).send({ stream });

            expect(res.status).toBe(HttpStatusCode.ok);

            // todo check response body
        });
    });

    describe(`when the command is invalid`, () => {
        const invalidTranslateFsa = {
            type: 'TRANSLATE_DIGITAL_TEXT_TITLE',
            payload: buildTestInstance(TranslateDigitalTextTitle, {
                aggregateCompositeIdentifier: {
                    id: digitalTextId,
                },
                // This is the original langauge code, so this command should fail
                languageCode: languageCodeForTitle,
            }),
            meta: {
                // shouldn't this come off the request?
                userId: testAdminUser.id,
            },
        };

        it(`should return the expected result`, async () => {
            const stream = [validCreateCommandFsa, invalidTranslateFsa];

            const res = await request(app.getHttpServer()).post(endpoint).send({ stream });

            expect(res.status).toBe(HttpStatusCode.badRequest);

            expect(res.body).toEqual({
                results: [
                    {
                        fsa: validCreateCommandFsa,
                        result: Ack,
                    },
                    {
                        fsa: invalidTranslateFsa,
                        result: new CommandExecutionError([
                            new DuplicateDigitalTextTitleError(
                                invalidTranslateFsa.payload.translation,
                                languageCodeForTitle
                            ),
                        ]),
                    },
                ],
            });
        });
    });
});
