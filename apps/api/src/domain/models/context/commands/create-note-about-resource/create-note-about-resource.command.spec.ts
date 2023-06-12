import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestData from '../../../../../test-data/buildTestData';
import formatAggregateType from '../../../../../view-models/presentation/formatAggregateType';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import {
    EdgeConnection,
    EdgeConnectionMemberRole,
    EdgeConnectionType,
} from '../../edge-connection.entity';
import { GeneralContext } from '../../general-context/general-context.entity';
import { PointContext } from '../../point-context/point-context.entity';
import { TimeRangeContext } from '../../time-range-context/time-range-context.entity';
import { EdgeConnectionContextType } from '../../types/EdgeConnectionContextType';
import { CreateNoteAboutResource } from './create-note-about-resource.command';

const commandType = 'CREATE_NOTE_ABOUT_RESOURCE';

const { resources: dummyResources, note: dummyNotes } = buildTestData();

const notesToCreate = dummyNotes.reduce(
    ({ seenResourceTypes, keepers }, note) => {
        const resourceType = note.members[0].compositeIdentifier.type;

        if (seenResourceTypes.includes(resourceType)) {
            // no-op
            return {
                seenResourceTypes,
                keepers,
            };
        }

        return {
            seenResourceTypes: seenResourceTypes.concat(resourceType),
            // keep this note and mark its member's resource type as seen
            keepers: keepers.concat(note),
        };
    },
    {
        seenResourceTypes: [],
        keepers: [],
    }
).keepers;

const validAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const validContext = new TimeRangeContext({
    type: EdgeConnectionContextType.timeRange,
    timeRange: {
        inPoint: 0,
        outPoint: validAudioItem.lengthMilliseconds / 2,
    },
});

const dummyNoteText = 'this is the dummy note';

const buildValidCommandFSAForAudioItem = (
    id: AggregateId
): FluxStandardAction<CreateNoteAboutResource> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.note,
            id,
        },
        resourceCompositeIdentifier: validAudioItem.getCompositeIdentifier(),
        resourceContext: validContext.toDTO(),
        text: dummyNoteText,
    },
});

const commandFSAFactory = new DummyCommandFSAFactory(buildValidCommandFSAForAudioItem);

const buildCreateNoteAboutResourceFSAForNote = (
    edgeConnection: EdgeConnection
): Omit<CreateNoteAboutResource, 'aggregateCompositeIdentifier'> => {
    const { members, note } = edgeConnection;

    if (members.length !== 1) {
        throw new Error(
            `Cannot build a CREATE_NOTE_ABOUT_RESOURCE FSA for an edge connection with more than 1 member`
        );
    }

    const selfMember = members[0];

    if (selfMember.role !== EdgeConnectionMemberRole.self) {
        throw new Error(
            `Cannot build a CREATE_NOTE_ABOUT_RESOURCE FSA for an edge connection whose member has a role: ${selfMember.role}`
        );
    }

    const { compositeIdentifier: resourceCompositeIdentifier, context: resourceContext } =
        selfMember;

    return {
        text: note,
        resourceCompositeIdentifier,
        resourceContext,
    };
};

const comprehensiveValidFSAs = notesToCreate
    // filter out the self-connections (true notes) from the db
    .filter(({ connectionType }: EdgeConnection) => connectionType === EdgeConnectionType.self)
    .map(buildCreateNoteAboutResourceFSAForNote)
    .map((payload) => ({
        type: commandType,
        payload,
    }));

/**
 * We need to make the test cases comprehensive
 * **Valid Cases**
 * - For every `ResourceType`
 *     - For every `ContextType` consistent with this `ResourceType
 *     - find the self note from the test data with this resource type and context type and attempt to create it it anew
 *         - note that we should not load the edge connections, but only the resources from the test data
 *
 * **Invalid Cases**
 * For every incompatible categorizabale type
 */

const validInitialState = new DeluxeInMemoryStore({
    /**
     * We put the test data for resources, but not the notes in the database.
     * We will attempt to create the notes.
     */
    ...dummyResources,
}).fetchFullSnapshotInLegacyFormat();

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

    // TODO make this comprehensive across all compatible resource type \ context type combos
    describe(`when the command is valid`, () => {
        comprehensiveValidFSAs
            .filter(
                (fsa) => fsa.payload.resourceCompositeIdentifier.type === ResourceType.photograph
            )
            .forEach((fsa) => {
                const { payload } = fsa;

                const { resourceCompositeIdentifier, resourceContext } = payload;

                const { type: resourceType } = resourceCompositeIdentifier;

                describe(`resource type: ${resourceType}, context type: ${resourceContext.type}`, () => {
                    it.only(`should succeed with the expected database updates`, async () => {
                        await assertCreateCommandSuccess(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            buildValidCommandFSA: (id: AggregateId) => ({
                                type: commandType,
                                payload: {
                                    ...payload,
                                    aggregateCompositeIdentifier: {
                                        type: AggregateType.note,
                                        id,
                                    },
                                },
                            }),
                            initialState: validInitialState,
                        });
                    });
                });
            });
        // it(`should succeed with the expected updates to the database`, async () => {
        //     await assertCreateCommandSuccess(assertionHelperDependencies, {
        //         systemUserId: dummySystemUserId,
        //         buildValidCommandFSA: buildValidCommandFSAForAudioItem,
        //         initialState: validInitialState,
        //     });
        // });
    });

    describe(`when the command is invalid`, () => {
        /**
         * This would occur when a user is attempting to push through a command with
         * context.type set to some random string. I suppose it will also happen
         * if we add a new context union member and forget to register it via the
         * union member decorator.
         */
        describe(`when the context type is not registered as a context type`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id) =>
                        commandFSAFactory.build(id, {
                            resourceContext: {
                                type: `BOGUS TYPE`,
                            },
                        }),
                    initialState: new DeluxeInMemoryStore({
                        [ResourceType.audioItem]: [validAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });

        describe(`when the context type is not allowed for the given resource type`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id) =>
                        commandFSAFactory.build(id, {
                            resourceContext: new PointContext({
                                type: EdgeConnectionContextType.point2D,
                                point: [1, 2],
                            }),
                        }),
                    initialState: new DeluxeInMemoryStore({
                        [ResourceType.audioItem]: [validAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });

        describe(`when the context is inconsistent with the state of the resource it contextualizes`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (id) =>
                        commandFSAFactory.build(id, {
                            resourceContext: new TimeRangeContext({
                                type: EdgeConnectionContextType.timeRange,
                                timeRange: {
                                    inPoint: 0,
                                    // out of bounds
                                    outPoint: validAudioItem.getTimeBounds[1] + 100,
                                },
                            }),
                        }),
                    initialState: new DeluxeInMemoryStore({
                        [ResourceType.audioItem]: [validAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });

        describe(`when the resource does not exist`, () => {
            Object.values(ResourceType).forEach((resourceType) => {
                describe(`when the reosuce of type: ${formatAggregateType(
                    resourceType
                )} does not exist`, () => {
                    it(`should fail with the expected errors`, async () => {
                        await assertCreateCommandError(assertionHelperDependencies, {
                            systemUserId: dummySystemUserId,
                            buildCommandFSA: (id) =>
                                commandFSAFactory.build(id, {
                                    resourceCompositeIdentifier: {
                                        type: resourceType,
                                        id: validAudioItem.id,
                                    },
                                    resourceContext: new GeneralContext().toDTO(),
                                }),
                            initialState: new DeluxeInMemoryStore({
                                // Empty
                            }).fetchFullSnapshotInLegacyFormat(),
                        });
                    });
                });
            });
        });

        describe(`when the new EdgeConnection ID was not generated with our ID generation system`, () => {
            it('should return the expected error', async () => {
                const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) => commandFSAFactory.build(bogusId),
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.audioItem]: [validAudioItem],
                    }).fetchFullSnapshotInLegacyFormat(),
                    // TODO Tighten up all error checks
                });
            });
        });

        describe('when the payload has an invalid type', () => {
            generateCommandFuzzTestCases(CreateNoteAboutResource).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSAForAudioItem(dummyUuid)
                            );
                        });
                    });
                }
            );
        });
    });
});
