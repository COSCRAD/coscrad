import { AggregateType, LanguageCode, MIMEType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Photograph } from '../../entities/photograph.entity';
import { CreatePhotograph } from './create-photograph.command';

const commandType = `CREATE_PHOTOGRAPH`;

const dummyFsa = buildTestCommandFsaMap().get(commandType) as CommandFSA<CreatePhotograph>;

const existingMediaItem = getValidAggregateInstanceForTest(AggregateType.mediaItem).clone({
    mimeType: MIMEType.png,
    lengthMilliseconds: undefined,
});

const titleText = `The Photograph Title`;

const languageCodeForTitle = LanguageCode.English;

const fsaFactory = new DummyCommandFsaFactory((id: AggregateId) =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier: { id },
            mediaItemId: existingMediaItem.id,
            title: titleText,
            languageCodeForTitle,
        },
    })
);

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        databaseProvider.close();

        await app.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed and persist the new photograph`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await testRepositoryProvider.addFullSnapshot(
                        new DeluxeInMemoryStore({
                            [AggregateType.mediaItem]: [existingMediaItem],
                        }).fetchFullSnapshotInLegacyFormat()
                    );
                },
                buildValidCommandFSA: (id) => fsaFactory.build(id, {}),
                checkStateOnSuccess: async ({ aggregateCompositeIdentifier: { id } }) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.photograph)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(Photograph);

                    const newPhotograph = searchResult as Photograph;

                    const originalTextItemForName = newPhotograph.getName().getOriginalTextItem();

                    expect(originalTextItemForName.text).toBe(titleText);

                    expect(originalTextItemForName.languageCode).toBe(languageCodeForTitle);

                    expect(newPhotograph.published).toBe(false);

                    assertEventRecordPersisted(
                        newPhotograph,
                        `PHOTOGRAPH_CREATED`,
                        dummySystemUserId
                    );
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the media item does not exist`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        Promise.resolve();
                    },
                    buildCommandFSA: (id) => fsaFactory.build(id),
                    checkError: (error, id) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalReferenceByAggregateError(
                                    {
                                        type: AggregateType.photograph,
                                        id,
                                    },
                                    [existingMediaItem.getCompositeIdentifier()]
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the media item's MIME Type is not consistent with a photograph`, () => {
            // TODO Add jpg and bmp
            const allowedMimeTypes = [MIMEType.png, MIMEType.jpg, MIMEType.bmp];

            Object.values(MIMEType)
                .filter((mimeType) => !allowedMimeTypes.includes(mimeType))
                .forEach((invalidMimeType) => {
                    describe(`when the invalid MIME Type is: ${invalidMimeType}`, () => {
                        it(`should fail with the expected errors`, async () => {
                            await assertCreateCommandError(assertionHelperDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: (id) => fsaFactory.build(id),
                                seedInitialState: async () => {
                                    await testRepositoryProvider.addFullSnapshot(
                                        new DeluxeInMemoryStore({
                                            [AggregateType.mediaItem]: [
                                                existingMediaItem.clone({
                                                    mimeType: invalidMimeType,
                                                }),
                                            ],
                                        }).fetchFullSnapshotInLegacyFormat()
                                    );
                                },
                            });
                        });
                    });
                });
        });

        describe(`when the ID was not generated with our system`, () => {
            it(`should fail with the expected error`, async () => {
                const bogusId = buildDummyUuid(444);

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: () => fsaFactory.build(bogusId),
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                [AggregateType.mediaItem]: [existingMediaItem],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    checkError: (error) => {
                        const message = error.toString();

                        const invalidMessages = [message].filter((m) =>
                            m.includes('not generated')
                        );

                        expect(invalidMessages).toEqual([]);
                    },
                });
            });
        });

        /**
         * TODO [https://github.com/COSCRAD/coscrad/pull/521#discussion_r1431743331]
         *
         * Allow the user to set the photograph's dimensions. At this point, test
         * when the dimensions are invalid.
         */
    });
});
