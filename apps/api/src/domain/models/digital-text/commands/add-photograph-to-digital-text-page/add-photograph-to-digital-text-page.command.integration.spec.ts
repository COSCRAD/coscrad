import { AggregateType } from '@coscrad/api-interfaces';
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
import { TestEventStream } from '../../../../../test-data/events';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';

const commandType = `ADD_PHOTOGRAPH_TO_DIGITAL_TEXT_PAGE`;

const digitalTextCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: buildDummyUuid(9),
} as const;

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddPhotographToDigitalTextPage>;

const targetPageIdentifier = '55';

const existingPhotographId = buildDummyUuid(78);

const fsaFactory = new DummyCommandFsaFactory(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier: digitalTextCompositeIdentifier,
            pageIdentifier: targetPageIdentifier,
            photographId: existingPhotographId,
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

    const targetPageIdentifier = '55';

    const pageAddedToDigitalText = new TestEventStream()
        .andThen<DigitalTextCreated>({
            type: 'DIGITAL_TEXT_CREATED',
        })
        .andThen<PageAddedToDigitalText>({
            type: 'PAGE_ADDED_TO_DIGITAL_TEXT',
            payload: {
                identifier: targetPageIdentifier,
            },
        });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(pageAddedToDigitalText.as(digitalTextCompositeIdentifier));
                },
                buildValidCommandFSA: () => fsaFactory.build(),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the digital text does not exist`, () => {
            it.todo(`should fail with the expected error`);
        });

        describe(`when the photograph does not exist`, () => {
            it.todo(`should fail with the expected error`);
        });

        describe(`when the page does not exist`, () => {
            it.todo(`should fail with the expected error`);
        });

        describe(`when the page already has a photograph`, () => {
            it.todo(`should fail with the expected error`);
        });
    });
});
