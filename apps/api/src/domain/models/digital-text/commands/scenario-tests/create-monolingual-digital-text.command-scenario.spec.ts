import {
    CoscradUserRole,
    HttpStatusCode,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { CannotAddDuplicateTranslationError } from '../../../../../domain/common/entities/errors';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../domain/interfaces/id-manager.interface';
import cloneToPlainObject from '../../../../../lib/utilities/cloneToPlainObject';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import { CreateDigitalText } from '../create-digital-text.command';
import { TranslateDigitalTextTitle } from '../translate-digital-text-title';

const endpoint = '/commands/bulk';

const digitalTextTitle = 'A wondeful book!';

const languageCodeForTitle = LanguageCode.English;

const testAdminUser = buildTestInstance(CoscradUser, {
    id: dummySystemUserId,
    roles: [CoscradUserRole.projectAdmin],
});

describe(`When creating a full digital text`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        ({ testRepositoryProvider, app, databaseProvider } = await setUpIntegrationTest(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            },
            {
                testUserWithGroups: new CoscradUserWithGroups(testAdminUser, []),
            }
        ));
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
            const digitalTextId = await app.get<IIdManager>(ID_MANAGER_TOKEN).generate();

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
                    contributorIds: [],
                },
            };

            const stream = [validCreateCommandFsa];

            const res = await request(app.getHttpServer()).post(endpoint).send({ stream });

            expect(res.status).toBe(HttpStatusCode.ok);

            const { body } = res;

            const { results } = body;

            expect(results).toHaveLength(1);

            expect(results[0]).toEqual({
                fsa: {
                    ...cloneToPlainObject(validCreateCommandFsa),
                    meta: {
                        ...validCreateCommandFsa.meta,
                        userId: dummySystemUserId,
                    },
                },
                result: 'ACK',
            });
        });
    });

    describe(`when the command is invalid`, () => {
        it(`should return the expected result`, async () => {
            const digitalTextId = await app.get<IIdManager>(ID_MANAGER_TOKEN).generate();

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

            const stream = [validCreateCommandFsa, invalidTranslateFsa];

            const res = await request(app.getHttpServer()).post(endpoint).send({ stream });

            expect(res.status).toBe(HttpStatusCode.badRequest);

            const { results } = res.body;

            expect(results[0]).toEqual({
                fsa: cloneToPlainObject(validCreateCommandFsa),
                result: 'ACK',
            });

            expect(results[1].fsa).toEqual(cloneToPlainObject(invalidTranslateFsa));

            const errorMessage = results[1].result.toString();

            expect(errorMessage.toLowerCase()).toContain('failed at command [1]');

            expect(errorMessage.toLowerCase()).toContain(
                new CommandExecutionError([
                    new CannotAddDuplicateTranslationError(
                        new MultilingualTextItem({
                            text: invalidTranslateFsa.payload.translation,
                            languageCode: invalidTranslateFsa.payload.languageCode,
                            role: MultilingualTextItemRole.freeTranslation,
                        }),
                        buildMultilingualTextWithSingleItem(
                            validCreateCommandFsa.payload.title,
                            validCreateCommandFsa.payload.languageCodeForTitle
                        )
                    ),
                ])
                    .toString()
                    .toLowerCase()
            );
        });
    });
});
