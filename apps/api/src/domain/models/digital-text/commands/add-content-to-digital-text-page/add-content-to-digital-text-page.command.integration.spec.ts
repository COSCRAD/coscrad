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
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
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

    describe('when the command is valid', () => {
        it(`should succeed with the expected updates`, async () => {
            const eventHistory = [];

            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app.get(ArangoEventRepository).appendEvents(eventHistory);
                },
                buildValidCommandFSA: () => commandFsaFactory.build(),
            });
        });
    });
});
