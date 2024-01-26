import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { TestEventStream } from '../../../../../test-data/events';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import { PageAddedToDigitalText } from '../add-page-to-digital-text/page-added-to-digital-text.event';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddPhotographToDigitalTextPage } from './add-photograph-to-digital-text-page.command';
import { PhotographAddedToDigitalTextPage } from './photograph-added-to-digital-text-page.event';

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

const existingPhotograph = getValidAggregateInstanceForTest(AggregateType.photograph).clone({
    id: existingPhotographId,
});

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

    const digitalTextCreated = new TestEventStream().andThen<DigitalTextCreated>({
        type: 'DIGITAL_TEXT_CREATED',
    });

    const pageAddedToDigitalText = digitalTextCreated.andThen<PageAddedToDigitalText>({
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

                    await testRepositoryProvider
                        .forResource(ResourceType.photograph)
                        .create(existingPhotograph);
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
                        // no digital texts
                        await testRepositoryProvider
                            .forResource(ResourceType.photograph)
                            .create(existingPhotograph);
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new AggregateNotFoundError(existingPhotograph.getCompositeIdentifier())
                        );
                    },
                });
            });
        });

        describe(`when the photograph does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents(
                                pageAddedToDigitalText.as(digitalTextCompositeIdentifier)
                            );

                        // no photographs
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                    checkError: (result) => {
                        assertErrorAsExpected(
                            result,
                            new AggregateNotFoundError(existingPhotograph.getCompositeIdentifier())
                        );
                    },
                });
            });
        });

        describe(`when the page does not exist`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(
                            // the page has not yet been added
                            digitalTextCreated.as(digitalTextCompositeIdentifier)
                        );

                        await testRepositoryProvider
                            .forResource(ResourceType.photograph)
                            .create(existingPhotograph);
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                });
            });
        });

        describe(`when the page already has a photograph`, () => {
            it(`should fail`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app.get(ArangoEventRepository).appendEvents(
                            // the page already has a photograph
                            pageAddedToDigitalText
                                .andThen<PhotographAddedToDigitalTextPage>({
                                    type: 'PHOTOGRAPH_ADDED_TO_DIGITAL_TEXT_PAGE',
                                    payload: {
                                        pageIdentifier: targetPageIdentifier,
                                        photographId: existingPhotographId,
                                    },
                                })
                                .as(digitalTextCompositeIdentifier)
                        );

                        await testRepositoryProvider
                            .forResource(ResourceType.photograph)
                            .create(existingPhotograph);
                    },
                    buildCommandFSA: () => fsaFactory.build(),
                });
            });
        });
    });
});
