import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { ContentAddedToDigitalTextPage } from '../add-content-to-digital-text-page';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddAudioForDigitalTextPage } from './add-audio-for-digital-text-page.command';

const commandType = 'ADD_AUDIO_FOR_DIGITAL_TEXT_PAGE';

// TODO make this helper fail with a more useful message
const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddAudioForDigitalTextPage>;

const languageCode = LanguageCode.Chilcotin;

const existingPageIdentifier = `4`;

const digitalTextId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const aggregateCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: digitalTextId,
};

const commandFsaFactory = new DummyCommandFsaFactory<AddAudioForDigitalTextPage>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            languageCode,
            pageIdentifier: existingPageIdentifier,
        },
    })
);

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

    const eventStreamForDigitalTextWithNoPages = new TestEventStream().andThen<DigitalTextCreated>({
        type: `DIGITAL_TEXT_CREATED`,
        payload: {},
    });

    const eventStreamForDigitalTextWithPage = eventStreamForDigitalTextWithNoPages
        .andThen<PageAddedToDigitalText>({
            type: `PAGE_ADDED_TO_DIGITAL_TEXT`,
            payload: {
                identifier: existingPageIdentifier,
            },
        })
        .andThen<ContentAddedToDigitalTextPage>({
            type: `CONTENT_ADDED_TO_DIGITAL_TEXT_PAGE`,
            payload: {
                pageIdentifier: existingPageIdentifier,
                languageCode,
            },
        });

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            const eventHistory = eventStreamForDigitalTextWithPage.as({
                id: digitalTextId,
            });

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                buildValidCommandFSA: () =>
                    commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            id: digitalTextId,
                        },
                    }),
            });
        });
    });
});
