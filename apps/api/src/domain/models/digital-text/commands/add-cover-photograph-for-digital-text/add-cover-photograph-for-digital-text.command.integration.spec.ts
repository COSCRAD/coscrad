import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddCoverPhotographForDigitalText } from './add-cover-photograph-for-digital-text.command';

const commandType = `ADD_COVER_PHOTOGRAPH_FOR_DIGITAL_TEXT`;

const digitalTextCompositeIdentifier = {
    type: AggregateType.digitalText,
    id: buildDummyUuid(21),
} as const;

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<AddCoverPhotographForDigitalText>;

const existingPhotographId = buildDummyUuid(12);

const existingCoverPhotograph = getValidAggregateInstanceForTest(AggregateType.photograph).clone({
    id: existingPhotographId,
});

const fsaFactory = new DummyCommandFsaFactory(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            photographId: existingPhotographId,
            aggregateCompositeIdentifier: digitalTextCompositeIdentifier,
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

    const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
    });

    const validEventHistoryForDigitalTextWithNoCoverPhotograph = digitalTextCreated.as(
        digitalTextCompositeIdentifier
    );

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected updates`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await app
                        .get(ArangoEventRepository)
                        .appendEvents(digitalTextCreated.as(digitalTextCompositeIdentifier));

                    await testRepositoryProvider
                        .forResource(ResourceType.photograph)
                        .create(existingCoverPhotograph);
                },
                buildValidCommandFSA: () => fsaFactory.build(),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the digital text does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.photograph)
                            .create(existingCoverPhotograph);
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new AggregateNotFoundError(digitalTextCompositeIdentifier),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the cover photograph does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(validEventHistoryForDigitalTextWithNoCoverPhotograph);
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    digitalTextCompositeIdentifier,
                                    [existingCoverPhotograph.getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
