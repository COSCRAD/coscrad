import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { DIGITAL_TEXT_CREATED } from '../../constants';
import { DigitalText } from '../../entities';
import { DigitalTextCreated } from '../digital-text-created.event';
import { DigitalTextTitleTranslated } from './digital-text-title-translated.event';
import { TranslateDigitalTextTitle } from './translate-digital-text-title.command';

const commandType = 'TRANSLATE_DIGITAL_TEXT_TITLE';

const digitalTextId = buildDummyUuid(2);

const digitalTextCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const originalLanguageCode = LanguageCode.English;

const translationLanguageCode = LanguageCode.Chilcotin;

const translationTitle = 'translation of title';

const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
    type: DIGITAL_TEXT_CREATED,
    payload: {
        languageCodeForTitle: originalLanguageCode,
    },
});

const _digitalTextTitleTranslated = digitalTextCreated.andThen<DigitalTextTitleTranslated>({
    type: 'DIGITAL_TEXT_TITLE_TRANSLATED',
    payload: {
        translation: translationTitle,
        languageCode: translationLanguageCode,
    },
});

const validPayload: TranslateDigitalTextTitle = {
    aggregateCompositeIdentifier: digitalTextCompositeIdentifier,
    languageCode: translationLanguageCode,
    translation: translationTitle,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates to the database`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                seedInitialState: async () => {
                    const eventHistory = digitalTextCreated.as(digitalTextCompositeIdentifier);

                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                checkStateOnSuccess: async () => {
                    const digitalTextSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.digitalText)
                        .fetchById(digitalTextId);

                    expect(digitalTextSearchResult).toBeInstanceOf(DigitalText);
                },
            });
        });
    });
});
