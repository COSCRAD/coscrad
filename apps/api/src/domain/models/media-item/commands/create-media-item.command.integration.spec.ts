import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../types/DTO';
import InvariantValidationError from '../../../domainModelValidators/errors/InvariantValidationError';
import MediaItemHasNoTitleInAnyLanguageError from '../../../domainModelValidators/errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { assertCommandFailsDueToTypeError } from '../../../models/__tests__/command-helpers/assert-command-payload-type-error';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { MediaItem } from '../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';

const commandType = 'CREATE_MEDIA_ITEM';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateMediaItem>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.mediaItem },
        title: 'Fishing Video',
        titleEnglish: 'Fishing Video (Engl)',
        url: 'https://www.mysoundbox.org/vid.mp4',
        mimeType: MIMEType.mp4,
    },
});

const existingMediaItemId = `702096a0-c52f-488f-b5dc-22192e9aca3e`;

const buildInvalidFSA = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof CreateMediaItem, unknown>> = {}
): FluxStandardAction<DTO<CreateMediaItem>> => ({
    type: commandType,
    payload: {
        ...buildValidCommandFSA(id).payload,
        ...(payloadOverrides as Partial<CreateMediaItem>),
    },
});

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const dummyAdminUserId = dummyUuid;

describe('CreateMediaItem', () => {
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

    afterAll(async () => {
        await app.close();
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

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummyAdminUserId,
                buildValidCommandFSA,
                initialState: emptyInitialState,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateMediaItem) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const mediaItemSearchResult = await testRepositoryProvider
                        .forResource<MediaItem>(ResourceType.mediaItem)
                        .fetchById(id);

                    expect(mediaItemSearchResult).not.toBe(NotFound);

                    expect(mediaItemSearchResult).not.toBeInstanceOf(InternalError);

                    expect(mediaItemSearchResult).toBeInstanceOf(MediaItem);

                    const mediaItem = mediaItemSearchResult as MediaItem;

                    assertEventRecordPersisted(mediaItem, 'MEDIA_ITEM_CREATED', dummyAdminUserId);
                },
            });
        });
    });

    describe('when the command payload type is invalid', () => {
        generateCommandFuzzTestCases(CreateMediaItem).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property ${propertyName} has the invalid value: ${invalidValue} (${description})`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA('unused-id')
                        );
                    });
                });
            }
        );
    });

    describe('when the external state is invalid', () => {
        describe('when the ID was not generated by our system', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(buildDummyUuid()),
                    initialState: emptyInitialState,
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toBeInstanceOf(InternalError);
                    },
                });
            });
        });

        describe('when there is already a media item with the given id', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(existingMediaItemId),
                    initialState: buildInMemorySnapshot({
                        resources: {
                            mediaItem: [
                                getValidAggregateInstanceForTest(ResourceType.mediaItem).clone({
                                    id: existingMediaItemId,
                                }),
                            ],
                        },
                    }),

                    checkError: (error) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        expect(error.innerErrors.length).toBe(1);

                        const innerError = error.innerErrors[0];

                        expect(innerError).toEqual(
                            new ResourceIdAlreadyInUseError({
                                id: existingMediaItemId,
                                resourceType: ResourceType.mediaItem,
                            })
                        );
                    },
                });
            });
        });
    });

    describe('when an invariant validation rule is not satisfied by the new media item', () => {
        describe('when the media item has no title in any language', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummyAdminUserId,
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            title: null,
                            titleEnglish: null,
                        }),
                    initialState: emptyInitialState,
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerErrors = error.innerErrors;

                        expect(innerErrors[0]).toBeInstanceOf(InvariantValidationError);

                        const innermostErrors = innerErrors[0].innerErrors[0];

                        expect(innermostErrors).toBeInstanceOf(
                            MediaItemHasNoTitleInAnyLanguageError
                        );
                    },
                });
            });
        });
    });

    describe('when the payload has an invalid type', () => {
        describe(`when the payload has an invalid aggregate type`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.mediaItem)
                .forEach((invalidAggregateType) => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            {
                                propertyName: 'aggregateCompositeIdentifier',
                                invalidValue: {
                                    type: invalidAggregateType,
                                    id: buildDummyUuid(15),
                                },
                            },
                            buildValidCommandFSA(buildDummyUuid(12))
                        );
                    });
                });
        });

        generateCommandFuzzTestCases(CreateMediaItem).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA(buildDummyUuid(123))
                        );
                    });
                });
            }
        );
    });
});
