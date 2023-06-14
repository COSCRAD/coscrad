import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { isDeepStrictEqual } from 'util';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../../../../test-data/buildTestDataInFlatFormat';
import formatAggregateCompositeIdentifier from '../../../../../view-models/presentation/formatAggregateCompositeIdentifier';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import isContextAllowedForGivenResourceType from '../../../allowedContexts/isContextAllowedForGivenResourceType';
import { contextModelMap } from '../../__tests__';
import {
    EdgeConnection,
    EdgeConnectionMember,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { GeneralContext } from '../../general-context/general-context.entity';
import { EdgeConnectionContextType } from '../../types/EdgeConnectionContextType';

const commandType = `CONNECT_RESOURCES_WITH_NOTE`;

const testData = buildTestDataInFlatFormat();

const { note: testDualConnections } = testData;

const initialStateWithAllResourcesButNoConnections = new DeluxeInMemoryStore({
    ...testData,
    [AggregateType.note]: [],
}).fetchFullSnapshotInLegacyFormat();

const allDualEdgeConnections = (testDualConnections as EdgeConnection[]).filter(
    ({ connectionType }) => connectionType === EdgeConnectionType.dual
);

const existingTerm = getValidAggregateInstanceForTest(AggregateType.term);

const existingBook = getValidAggregateInstanceForTest(AggregateType.book);

const buildValidPayload = (id: AggregateId) => ({
    aggregateCompositeIdentifier: {
        type: AggregateType.note,
        id,
    },
    toMemberCompositeIdentifier: existingTerm.getCompositeIdentifier(),
    toMemberContext: new GeneralContext(),
    fromMemberCompositeIdentifier: existingBook.getCompositeIdentifier(),
    fromMemberContext: new GeneralContext(),
});

const buidlValidFsa = (id: AggregateId) => ({
    type: commandType,
    payload: buildValidPayload(id),
});

const commandFsaFactory = new DummyCommandFSAFactory(buidlValidFsa);

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

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
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
                    });
                });
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the context type for the to member is not allowed for the given resource type`, () => {
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

                    return (
                        Object.values(EdgeConnectionContextType)
                            // TODO Suppor these models
                            .filter(
                                (contextType) =>
                                    ![
                                        EdgeConnectionContextType.point2D,
                                        EdgeConnectionContextType.freeMultiline,
                                    ].includes(contextType)
                            )
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
                                        {
                                            ...toMember,
                                            context,
                                        },
                                    ],
                                });
                            })
                    );
                })
                .forEach((connection) => {
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
                                    fromMemberCompositeIdentifier: fromMember.compositeIdentifier,
                                    fromMemberContext: fromMember.context,
                                }),
                            initialState: initialStateWithAllResourcesButNoConnections,
                        });
                    });
                });
        });
    });
});
