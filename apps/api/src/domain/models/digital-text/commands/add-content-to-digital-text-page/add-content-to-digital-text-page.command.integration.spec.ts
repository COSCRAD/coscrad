import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events/test-event-stream';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddContentToDigitalTextPage } from './add-content-to-digital-text-page.command';

const commandType = 'ADD_CONTENT_TO_DIGITAL_TEXT_PAGE';

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddContentToDigitalTextPage>;

const languageCode = LanguageCode.English;

const text = 'Once upon a time there lived 3 little pigs.';

const existingPageIdentifier = '3';

const commandFsaFactory = new DummyCommandFsaFactory<AddContentToDigitalTextPage>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            languageCode,
            text,
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

    const eventStreamForDigitalTextWithPage = new TestEventStream()
        .andThen<DigitalTextCreated>({
            type: 'DIGITAL_TEXT_CREATED',
            payload: {
                // we don't care what the title is
            },
        })
        .andThen<PageAddedToDigitalText>({
            type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
            payload: {
                // this will be the target page for the new content
                identifier: existingPageIdentifier,
            },
        });

    describe('when the command is valid', () => {
        it(`should succeed with the expected updates`, async () => {
            const eventHistory = eventStreamForDigitalTextWithPage.as({
                id: dummyFsa.payload.aggregateCompositeIdentifier.id,
            });

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                buildValidCommandFSA: () => commandFsaFactory.build(),
            });
        });
    });

    describe(`when the digital text does not exist`, () => {
        it.todo(`should fail with the expected errors`);
    });

    describe(`when the page does not exist`, () => {
        it.todo(`should fail with the expected errors`);
    });

    describe(`when the page already has content`, () => {
        it.todo(`should fail with the expected errors`);
    });

    /**
     * TODO Consider moving this to a different (non netowrk) level
     */
    describe(`when the command payload type is invalid`, () => {
        describe(`when the aggregate type is not digital text`, () => {
            it.todo(`should fail with the expected errors`);
        });

        describe(`fuzz test`, () => {
            it.todo(`should have a test`);
        });
    });
});
