import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import buildTestDataInFlatFormat from '../../../../../test-data/buildTestDataInFlatFormat';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import InvariantValidationError from '../../../../domainModelValidators/errors/InvariantValidationError';
import ContextTypeIsNotAllowedForGivenResourceTypeError from '../../../../domainModelValidators/errors/context/edgeConnections/ContextTypeIsNotAllowedForGivenResourceTypeError';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType, isResourceType } from '../../../../types/ResourceType';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import isContextAllowedForGivenResourceType from '../../../allowedContexts/isContextAllowedForGivenResourceType';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import UuidNotGeneratedInternallyError from '../../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { buildContextModelMap } from '../../__tests__';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { GeneralContext } from '../../general-context/general-context.entity';
import { EdgeConnectionContextType } from '../../types/EdgeConnectionContextType';
import { ConnectResourcesWithNote } from './connect-resources-with-note.command';

const commandType = `CONNECT_RESOURCES_WITH_NOTE`;

const contextModelMap = buildContextModelMap();

const testData = buildTestDataInFlatFormat();

const { note: testDualConnections } = testData;

const initialStateWithAllResourcesButNoConnections = new DeluxeInMemoryStore({
    ...testData,
    [AggregateType.note]: [],
}).fetchFullSnapshotInLegacyFormat();

const eventSourcedResourceTypes = [
    AggregateType.song,
    AggregateType.digitalText,
    AggregateType.term,
];

const allDualEdgeConnections = (testDualConnections as EdgeConnection[])
    // TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced resources in this test
    .filter(
        ({ members }) =>
            !members.some(({ compositeIdentifier }) =>
                eventSourcedResourceTypes.includes(compositeIdentifier.type)
            )
    )
    .filter(({ connectionType }) => connectionType === EdgeConnectionType.dual);

const existingPhotograph = getValidAggregateInstanceForTest(AggregateType.photograph);

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText);

const buildValidPayload = (id: AggregateId) => ({
    aggregateCompositeIdentifier: {
        type: AggregateType.note,
        id,
    },
    toMemberCompositeIdentifier: existingPhotograph.getCompositeIdentifier(),
    toMemberContext: new GeneralContext(),
    fromMemberCompositeIdentifier: existingDigitalText.getCompositeIdentifier(),
    fromMemberContext: new GeneralContext(),
    text: 'this is how these resources are connected',
    languageCode: LanguageCode.English,
});

const buidlValidFsa = (id: AggregateId) => ({
    type: commandType,
    payload: buildValidPayload(id),
});

const commandFsaFactory = new DummyCommandFsaFactory(buidlValidFsa);

type ToMember = EdgeConnectionMember & {
    role: typeof EdgeConnectionMemberRole.to;
};

type FromMember = EdgeConnectionMember & {
    role: typeof EdgeConnectionMemberRole.from;
};

type ToAndFrom = {
    to: ToMember;
    from: FromMember;
};

type ResourceTypeAndContextType = {
    resourceType: string;
    contextType: string;
};

type ConnectionClassification = {
    to: ResourceTypeAndContextType;
    from: ResourceTypeAndContextType;
};

type SeenAndKeepers = {
    keepers: EdgeConnection[];
    seen: ConnectionClassification[];
};

const findToAndFromMembers = (members: EdgeConnectionMember[]): ToAndFrom => {
    const toMember = members.find(
        (member): member is ToMember => member.role === EdgeConnectionMemberRole.to
    );

    if (!toMember) {
        throw new Error(`failed to find a to member in members: ${members}`);
    }

    const fromMember = members.find(
        (member): member is FromMember => member.role === EdgeConnectionMemberRole.from
    );

    if (!fromMember) {
        throw new Error(`failed to find a from member in members: ${members}`);
    }

    return {
        to: toMember,
        from: fromMember,
    };
};

const classifyConnection = ({ members }: EdgeConnection): ConnectionClassification => {
    const { to: toMember, from: fromMember } = findToAndFromMembers(members);

    return {
        to: {
            resourceType: toMember.compositeIdentifier.type,
            contextType: toMember.context.type,
        },
        from: {
            resourceType: fromMember.compositeIdentifier.type,
            contextType: fromMember.context.type,
        },
    };
};

const hasSimilarConnectionBeenSeen = (
    seen: ConnectionClassification[],
    connection: EdgeConnection
): boolean => {
    const classification = classifyConnection(connection);

    return seen.some((seenClassification) => isDeepStrictEqual(seenClassification, classification));
};

const comprehensiveConnectionsToCreate = allDualEdgeConnections.reduce(
    ({ seen, keepers }: SeenAndKeepers, connection: EdgeConnection) => {
        if (hasSimilarConnectionBeenSeen(seen, connection)) {
            // no-op, simply ignore this connection as it is redundant to the test coverage
            return {
                seen,
                keepers,
            };
        }

        return {
            seen: seen.concat(classifyConnection(connection)),
            keepers: keepers.concat(connection),
        };
    },
    {
        keepers: [],
        seen: [],
    } as SeenAndKeepers
).keepers;

const buildDescriptionForMembers = (members: EdgeConnectionMember[]): string => {
    const { to: toMember, from: fromMember } = findToAndFromMembers(members);

    return [
        `to: ${formatAggregateCompositeIdentifier(toMember.compositeIdentifier)}`,
        `[context type: ${toMember.context.type}]`,
        `from: ${formatAggregateCompositeIdentifier(fromMember.compositeIdentifier)}`,
        `[context type: ${fromMember.context.type}]`,
    ].join(' ');
};

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

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });
    describe(`when the command is valid`, () => {
        comprehensiveConnectionsToCreate.forEach(({ members }) => {
            const { to: toMember, from: fromMember } = findToAndFromMembers(members);

            describe(buildDescriptionForMembers(members), () => {
                it(`should succeed with the expected database updates`, async () => {
                    await assertCreateCommandSuccess(assertionHelperDependencies, {
                        systemUserId: dummySystemUserId,
                        buildValidCommandFSA: (id) =>
                            commandFsaFactory.build(id, {
                                toMemberCompositeIdentifier: toMember.compositeIdentifier,
                                toMemberContext: toMember.context,
                                fromMemberCompositeIdentifier: fromMember.compositeIdentifier,
                                fromMemberContext: fromMember.context,
                            }),
                        initialState: initialStateWithAllResourcesButNoConnections,
                        checkStateOnSuccess: async ({
                            aggregateCompositeIdentifier: { id },
                            text,
                        }: ConnectResourcesWithNote) => {
                            const newEdgeConnectionSearchResult = await testRepositoryProvider
                                .getEdgeConnectionRepository()
                                .fetchById(id);

                            expect(newEdgeConnectionSearchResult).not.toBe(NotFound);

                            expect(newEdgeConnectionSearchResult).not.toBeInstanceOf(InternalError);

                            const newConnection = newEdgeConnectionSearchResult as EdgeConnection;

                            const textForNewConnection =
                                newConnection.note.getOriginalTextItem().text;

                            expect(textForNewConnection).toBe(text);

                            assertEventRecordPersisted(
                                newConnection,
                                `RESOURCES_CONNECTED_WITH_NOTE`,
                                dummySystemUserId
                            );
                        },
                    });
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        const edgeConnectionTypesToKeep = Object.values(EdgeConnectionContextType).filter(
            (contextType) =>
                // TODO Support these models
                ![
                    EdgeConnectionContextType.point2D,
                    EdgeConnectionContextType.freeMultiline,
                ].includes(contextType)
        );

        describe(`when the context type for a member is not allowed for the given resource type`, () => {
            comprehensiveConnectionsToCreate
                .reduce(
                    (
                        { keepers, seen }: { seen: ResourceType[]; keepers: EdgeConnection[] },
                        connection
                    ) => {
                        const { to: toMember } = findToAndFromMembers(connection.members);

                        if (seen.includes(toMember.compositeIdentifier.type)) {
                            // no-op, we already have a connection with a to member with this `ResourceType`
                            return {
                                seen,
                                keepers,
                            };
                        }

                        return {
                            seen: seen.concat(toMember.compositeIdentifier.type),
                            keepers: keepers.concat(connection),
                        };
                    },
                    {
                        seen: [],
                        keepers: [],
                    }
                )
                .keepers.flatMap((connection) => {
                    const { to: toMember, from: fromMember } = findToAndFromMembers(
                        connection.members
                    );

                    return [
                        ...edgeConnectionTypesToKeep
                            .filter(
                                (contextType) =>
                                    !isContextAllowedForGivenResourceType(
                                        contextType,
                                        toMember.compositeIdentifier.type
                                    )
                            )
                            .map((contextType) => {
                                if (!contextModelMap.has(contextType)) {
                                    throw new Error(
                                        `failed to find a context instance of type: ${contextType}`
                                    );
                                }

                                const context = contextModelMap.get(contextType);

                                return connection.clone({
                                    members: [
                                        fromMember,
                                        toMember.clone({
                                            context,
                                        }),
                                    ],
                                });
                            }),
                        ...edgeConnectionTypesToKeep
                            .filter(
                                (contextType) =>
                                    !isContextAllowedForGivenResourceType(
                                        contextType,
                                        fromMember.compositeIdentifier.type
                                    )
                            )
                            .map((contextType) => {
                                if (!contextModelMap.has(contextType)) {
                                    throw new Error(
                                        `failed to find a context instance of type: ${contextType}`
                                    );
                                }

                                const context = contextModelMap.get(contextType);

                                return connection.clone({
                                    members: [
                                        fromMember.clone({
                                            context,
                                        }),
                                        toMember,
                                    ],
                                });
                            }),
                    ];
                })
                .forEach((connection) => {
                    describe(buildDescriptionForMembers(connection.members), () => {
                        const { to: toMember, from: fromMember } = findToAndFromMembers(
                            connection.members
                        );

                        it(`should fail with the expected error`, async () => {
                            await assertCreateCommandError(assertionHelperDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: (id) =>
                                    commandFsaFactory.build(id, {
                                        toMemberCompositeIdentifier: toMember.compositeIdentifier,
                                        toMemberContext: toMember.context,
                                        fromMemberCompositeIdentifier:
                                            fromMember.compositeIdentifier,
                                        fromMemberContext: fromMember.context,
                                    }),
                                initialState: initialStateWithAllResourcesButNoConnections,
                                checkError: (result, id) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new InvariantValidationError(
                                                {
                                                    type: AggregateType.note,
                                                    id,
                                                },
                                                // We check the innermost errors below
                                                []
                                            ),
                                        ])
                                    );

                                    const innerMostError = result.innerErrors[0].innerErrors[0];

                                    /**
                                     * We could tighten this up more if we flow through information
                                     * about whether we have invalidated the to or from member for this test case
                                     */
                                    expect(innerMostError).toBeInstanceOf(
                                        ContextTypeIsNotAllowedForGivenResourceTypeError
                                    );
                                },
                            });
                        });
                    });
                });
        });

        describe(`when the context provided is inconsistent with the to member state`, () => {
            comprehensiveConnectionsToCreate
                .filter((connection) => {
                    const { to: toMember } = findToAndFromMembers(connection.members);

                    return ![EdgeConnectionContextType.general].includes(
                        toMember.context.type as EdgeConnectionContextType
                    );
                })
                .forEach((connection) => {
                    describe(buildDescriptionForMembers(connection.members), () => {
                        it(`should fail with the expected error`, async () => {
                            const { to: toMember, from: fromMember } = findToAndFromMembers(
                                connection.members
                            );

                            await assertCreateCommandError(assertionHelperDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: (id) =>
                                    commandFsaFactory.build(id, {
                                        toMemberCompositeIdentifier: toMember.compositeIdentifier,
                                        // here we replace the context for the to member with a context that is designed to be invalid against any resource's state
                                        toMemberContext: contextModelMap.get(toMember.context.type),
                                        fromMemberCompositeIdentifier:
                                            fromMember.compositeIdentifier,
                                        fromMemberContext: fromMember.context,
                                    }),
                                initialState: initialStateWithAllResourcesButNoConnections,
                                checkError: (result) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new InvalidExternalStateError(
                                                // We would need to match errors to context types to check the inner errors
                                                []
                                            ),
                                        ])
                                    );
                                },
                            });
                        });
                    });
                });
        });

        describe(`when the context provided is inconsistent with the from member state`, () => {
            comprehensiveConnectionsToCreate
                .filter((connection) => {
                    const { from: fromMember } = findToAndFromMembers(connection.members);

                    return ![EdgeConnectionContextType.general].includes(
                        fromMember.context.type as EdgeConnectionContextType
                    );
                })
                .forEach((connection) => {
                    describe(buildDescriptionForMembers(connection.members), () => {
                        it(`should fail with the expected error`, async () => {
                            const { to: toMember, from: fromMember } = findToAndFromMembers(
                                connection.members
                            );

                            await assertCreateCommandError(assertionHelperDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: (id) =>
                                    commandFsaFactory.build(id, {
                                        toMemberCompositeIdentifier: toMember.compositeIdentifier,
                                        toMemberContext: toMember.context,
                                        fromMemberCompositeIdentifier:
                                            fromMember.compositeIdentifier,
                                        // overwrite the from member context with an inconsistent state
                                        fromMemberContext: contextModelMap.get(
                                            fromMember.context.type
                                        ),
                                    }),
                                initialState: initialStateWithAllResourcesButNoConnections,
                                checkError: (result) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new InvalidExternalStateError(
                                                // We would need to match errors to context types to check the inner errors
                                                []
                                            ),
                                        ])
                                    );
                                },
                            });
                        });
                    });
                });
        });

        describe(`when the resource type is a non-resource aggregate type on the property`, () => {
            ['toCompositeIdentifier', 'fromCompositeIdentifier'].forEach((propertyName) =>
                describe(propertyName, () => {
                    Object.values(AggregateType)
                        .filter((t) => !isResourceType(t))
                        .forEach((invalidResourceType) => {
                            describe(`when the resource type is: ${invalidResourceType}`, () => {
                                it(`should fail with a type error`, async () => {
                                    await assertCommandFailsDueToTypeError(
                                        assertionHelperDependencies,
                                        {
                                            propertyName: propertyName,
                                            invalidValue: {
                                                type: invalidResourceType,
                                                id: buildDummyUuid(567),
                                            },
                                        },
                                        commandFsaFactory.build(buildDummyUuid(662))
                                    );
                                });
                            });
                        });
                })
            );
        });

        describe(`when the context for a member has an unregistered context type`, () => {
            const bogusContextType = 'totally-booogus8';

            ['toMemberContext', 'fromMemberContext'].forEach((propertyName) => {
                describe(`${propertyName} : ${bogusContextType}`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCreateCommandError(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            initialState: initialStateWithAllResourcesButNoConnections,
                            buildCommandFSA: (id) =>
                                commandFsaFactory.build(id, {
                                    [propertyName]: { type: bogusContextType },
                                }),
                            checkError: (error) => {
                                expect(error.toString().includes(propertyName));
                            },
                        });
                    });
                });
            });
        });

        describe(`when the to member does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        // to member does not exist

                        // from member
                        [AggregateType.digitalText]: [existingDigitalText],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: (id) => commandFsaFactory.build(id),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateNotFoundError(
                                        existingPhotograph.getCompositeIdentifier()
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the from member does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                // to member
                                [AggregateType.photograph]: [existingPhotograph],

                                // from member Does Not Exist
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: (id) => commandFsaFactory.build(id),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateNotFoundError(
                                        existingDigitalText.getCompositeIdentifier()
                                    ),
                                ]),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the aggregate composite identifier uses a type other than note`, () => {
            Object.values(AggregateType)
                .filter((aggregateType) => aggregateType !== AggregateType.note)
                .forEach((invalidAggregateType) => {
                    describe(`when aggregateCompositeIdentifier.type = ${invalidAggregateType}`, () => {
                        it(`should fail with the exptected errors`, async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                {
                                    propertyName: 'aggregateCompositeIdentifier',
                                    invalidValue: {
                                        type: invalidAggregateType,
                                        id: buildDummyUuid(919),
                                    },
                                },
                                commandFsaFactory.build(buildDummyUuid(920))
                            );
                        });
                    });
                });
        });

        describe(`when there is already a note with the given ID`, () => {
            it(`should fail with the expected error`, async () => {
                const newId = await idManager.generate();

                const validCommandFSA = commandFsaFactory.build(newId);

                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        [AggregateType.note]: [
                            getValidAggregateInstanceForTest(AggregateType.note).clone({
                                id: newId,
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat()
                );

                const result = await commandHandlerService.execute(validCommandFSA, {
                    userId: dummySystemUserId,
                });

                expect(result).toBeInstanceOf(InternalError);
            });
        });

        describe(`when the ID was not generated with our ID generation system`, () => {
            it(`should fail with the expected error`, async () => {
                const bogusId = buildDummyUuid(589);

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_) =>
                        commandFsaFactory.build(undefined, {
                            aggregateCompositeIdentifier: { id: bogusId, type: AggregateType.note },
                        }),
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            initialStateWithAllResourcesButNoConnections
                        );
                    },
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new UuidNotGeneratedInternallyError(bogusId),
                            ])
                        );
                    },
                });
            });
        });

        describe('when the payload has an invalid type', () => {
            describe(`when the payload has an invalid aggregate type`, () => {
                Object.values(AggregateType)
                    .filter((t) => t !== AggregateType.note)
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
                                buidlValidFsa(buildDummyUuid(42))
                            );
                        });
                    });
            });

            generateCommandFuzzTestCases(ConnectResourcesWithNote).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                commandFsaFactory.build(buildDummyUuid(304))
                            );
                        });
                    });
                }
            );
        });
    });
});
