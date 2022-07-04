import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { MIMEType } from '@coscrad/data-types';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import generateRandomTestDatabaseName from '../../../../persistence/repositories/__tests__/generateRandomTestDatabaseName';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import InvalidResourceDTOError from '../../../domainModelValidators/errors/InvalidResourceDTOError';
import MediaItemHasNoTitleInAnyLanguageError from '../../../domainModelValidators/errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import getValidResourceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/utilities/getValidResourceInstanceForTest';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { assertCommandPayloadTypeError } from '../../../models/__tests__/command-helpers/assert-command-payload-type-error';
import { AggregateId } from '../../../types/AggregateId';
import { ResourceType } from '../../../types/ResourceType';
import buildInMemorySnapshot from '../../../utilities/buildInMemorySnapshot';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import InvalidCommandPayloadTypeError from '../../shared/common-command-errors/InvalidCommandPayloadTypeError';
import ResourceIdAlreadyInUseError from '../../shared/common-command-errors/ResourceIdAlreadyInUseError';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { MediaItem } from '../entities/media-item.entity';
import { CreateMediaItem } from './create-media-item.command';
import { CreateMediaItemCommandHandler } from './create-media-item.command-handler';

const commandType = 'CREATE_MEDIA_ITEM';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateMediaItem>> => ({
    type: commandType,
    payload: {
        id,
        title: 'Fishing Video',
        titleEnglish: 'Fishing Video (Engl)',
        contributions: [
            {
                contributorId: '101',
                role: 'editor',
            },
            {
                contributorId: '29',
                role: 'executive producer',
            },
        ],
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

const emptyInitialState = buildInMemorySnapshot({});

describe('CreateMediaItem', () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let arangoConnectionProvider: ArangoConnectionProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, arangoConnectionProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateRandomTestDatabaseName(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };

        commandHandlerService.registerHandler(
            commandType,
            new CreateMediaItemCommandHandler(testRepositoryProvider, idManager)
        );
    });

    afterAll(async () => {
        await arangoConnectionProvider.dropDatabaseIfExists();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA,
                initialState: emptyInitialState,
                checkStateOnSuccess: async ({ id }: CreateMediaItem) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const mediaItemSearchResult = await testRepositoryProvider
                        .forResource<MediaItem>(ResourceType.mediaItem)
                        .fetchById(id);

                    expect(mediaItemSearchResult).not.toBe(NotFound);

                    expect(mediaItemSearchResult).not.toBeInstanceOf(InternalError);

                    expect(mediaItemSearchResult).toBeInstanceOf(MediaItem);
                },
            });
        });
    });

    describe('when the command payload type is invalid', () => {
        describe('when `id` is a random string (not a UUID)', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) => buildInvalidFSA(id, { id: '855' }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'id'),
                });
            });
        });

        describe('when `title` is a number', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            title: 702,
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'title'),
                });
            });
        });

        describe('when `url` is an invalidly formatted string', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            url: 'djp:--woooo',
                        }),
                    initialState: emptyInitialState,
                });
            });
        });

        describe('when `titleEnglish` is an array', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            url: ['55', '57'],
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, `url`),
                });
            });
        });

        describe('when one of the contributions is a plain string', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            contributions: [
                                {
                                    contributorId: '33',
                                    role: 'set design',
                                },
                                'John did the edits',
                            ],
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'contributions'),
                });
            });
        });

        describe('when one of the contributions has a numeric ID', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            contributions: [
                                {
                                    contributorId: '33',
                                    role: 'set design',
                                },
                                {
                                    contributorId: 445,
                                    role: 'editor',
                                },
                            ],
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'contributions'),
                });
            });
        });

        describe('when one of the contributions has an array of roles', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            contributions: [
                                {
                                    contributorId: '33',
                                    role: ['screenplay', 'editor'],
                                },
                            ],
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'contributions'),
                });
            });
        });

        describe('when the MIME type is not one of the registered types', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            mimeType: 'bogus/mp12',
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'mimeType'),
                });
            });
        });

        describe('when RawData is a string', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            rawData: 'I should really be an object!',
                        }),
                    initialState: emptyInitialState,
                    checkError: (error) => assertCommandPayloadTypeError(error, 'rawData'),
                });
            });
        });

        describe('when there are multiple properties with invalid types', () => {
            it('should fail with multiple errors', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, { rawData: 'I am not an object', id: 99 }),
                    initialState: emptyInitialState,
                    checkError: (error) => {
                        expect(error).toBeInstanceOf(InvalidCommandPayloadTypeError);

                        const innerErrors = error.innerErrors;

                        expect(innerErrors.length).toBe(2);

                        expect(innerErrors.some((e) => e.toString().includes('rawData'))).toBe(
                            true
                        );

                        expect(innerErrors.some((e) => e.toString().includes('id'))).toBe(true);
                    },
                });
            });
        });
    });

    describe('when the external state is invalid', () => {
        describe('when the ID was not generated by our system', () => {
            it('should fail', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
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
                    buildCommandFSA: (_: AggregateId) => buildValidCommandFSA(existingMediaItemId),
                    initialState: buildInMemorySnapshot({
                        resources: {
                            mediaItem: [
                                getValidResourceInstanceForTest(ResourceType.mediaItem).clone({
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
                    buildCommandFSA: (id: AggregateId) =>
                        buildInvalidFSA(id, {
                            title: null,
                            titleEnglish: null,
                        }),
                    initialState: emptyInitialState,
                    checkError: (error: InternalError) => {
                        expect(error).toBeInstanceOf(CommandExecutionError);

                        const innerErrors = error.innerErrors;

                        expect(innerErrors[0]).toBeInstanceOf(InvalidResourceDTOError);

                        const innermostErrors = innerErrors[0].innerErrors[0];

                        expect(innermostErrors).toBeInstanceOf(
                            MediaItemHasNoTitleInAnyLanguageError
                        );
                    },
                });
            });
        });
    });
});
