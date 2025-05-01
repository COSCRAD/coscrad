import { FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest, {
    TestModuleInstances,
} from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { AggregateType, isAggregateType } from '../../../../types/AggregateType';
import { CategorizableType } from '../../../../types/CategorizableType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { DuplicateTagError } from '../errors';
import { TagResourceOrNote } from './tag-resource-or-note.command';

const commandType = 'TAG_RESOURCE_OR_NOTE';

describe(commandType, () => {
    let commandAssertionDependencies: TestModuleInstances;

    beforeAll(async () => {
        commandAssertionDependencies = await setUpIntegrationTest({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });
    });

    afterAll(async () => {
        await commandAssertionDependencies.app.close();

        commandAssertionDependencies.databaseProvider.close();
    });

    beforeEach(async () => {
        await commandAssertionDependencies.testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await commandAssertionDependencies.testRepositoryProvider.testTeardown();
    });

    /**
     * TODO We need to use the dummy UUID generator.
     */
    const tagToUpdate = getValidAggregateInstanceForTest(AggregateType.tag).clone({
        id: dummyUuid.slice(0, -1).concat('e'),
        // TODO add pre-existing members
        members: [],
    });

    const eventSourcedCategorizableTypes: CategorizableType[] = [
        ResourceType.song,
        ResourceType.digitalText,
        ResourceType.term,
        ResourceType.vocabularyList,
        ResourceType.playlist,
        ResourceType.audioItem,
        ResourceType.video,
    ];

    Object.values(CategorizableType)
        // TODO [https://www.pivotaltracker.com/story/show/185903292] Support event-sourced resources in this test
        .filter((ct) => !eventSourcedCategorizableTypes.includes(ct))
        .forEach((categorizableType) => {
            const categorizableToTag = getValidAggregateInstanceForTest(categorizableType).clone({
                id: dummyUuid,
            });

            const validCommandFSA: FluxStandardAction<DTO<TagResourceOrNote>> = {
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier: tagToUpdate.getCompositeIdentifier(),
                    taggedMemberCompositeIdentifier: categorizableToTag.getCompositeIdentifier(),
                },
            };

            const buildCommandFSA = () => validCommandFSA;

            const initialState = new DeluxeInMemoryStore({
                [categorizableType]: [categorizableToTag],
                [AggregateType.tag]: [tagToUpdate],
            }).fetchFullSnapshotInLegacyFormat();

            describe(`when tagging a categorizable of type: ${formatAggregateType(
                categorizableType
            )}`, () => {
                describe('when the command is valid', () => {
                    it('should succeed with the expected updates to the database', async () => {
                        await assertCommandSuccess(commandAssertionDependencies, {
                            systemUserId: dummySystemUserId,
                            buildValidCommandFSA: buildCommandFSA,
                            initialState,
                        });
                    });
                });

                describe('when the command is invalid', () => {
                    describe('when the command payload type is invalid', () => {
                        describe('when the tagged member has a non-categorizable aggregate type', () => {
                            Object.values(AggregateType)
                                .filter((aggregateType) => !isAggregateType(aggregateType))
                                .forEach((nonCategorizableAggregateType) => {
                                    it('should fail with a type error', async () => {
                                        await assertCommandFailsDueToTypeError(
                                            commandAssertionDependencies,
                                            {
                                                propertyName: 'taggedMemberCompositeIdentifier',
                                                invalidValue: {
                                                    ...validCommandFSA.payload
                                                        .taggedMemberCompositeIdentifier,
                                                    type: nonCategorizableAggregateType,
                                                },
                                            },
                                            buildCommandFSA()
                                        );
                                    });
                                });
                        });
                    });

                    describe('when the tag does not exist', () => {
                        it('should fail with the expected error', async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                buildCommandFSA,
                                initialState: new DeluxeInMemoryStore({
                                    [categorizableType]: [categorizableToTag],
                                    // The Tag does not exist
                                    [AggregateType.tag]: [],
                                }).fetchFullSnapshotInLegacyFormat(),
                                systemUserId: dummySystemUserId,
                                checkError: (error: InternalError) => {
                                    assertErrorAsExpected(
                                        error,
                                        new CommandExecutionError([
                                            new AggregateNotFoundError(
                                                tagToUpdate.getCompositeIdentifier()
                                            ),
                                        ])
                                    );
                                },
                            });
                        });
                    });

                    describe('when the categorizable to tag does not exist', () => {
                        it('should fail with the expected error', async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                buildCommandFSA,
                                initialState: new DeluxeInMemoryStore({
                                    // the categorizable (aggregate) to tag does not exist
                                    [categorizableType]: [],
                                    [AggregateType.tag]: [tagToUpdate],
                                }).fetchFullSnapshotInLegacyFormat(),
                                systemUserId: dummySystemUserId,
                                checkError: (error: InternalError) => {
                                    const { innerErrors } = error;

                                    assertErrorAsExpected(
                                        /**
                                         * Drill down to the level where we expect this error.
                                         * Alternatively, we could call `.toString`
                                         * and check the message.
                                         **/
                                        innerErrors[0].innerErrors[0],
                                        new InvalidExternalReferenceByAggregateError(
                                            tagToUpdate.getCompositeIdentifier(),
                                            [categorizableToTag.getCompositeIdentifier()]
                                        )
                                    );
                                },
                            });
                        });
                    });

                    describe('when the categorizable already has this tag', () => {
                        it('should fail with the expected error', async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                buildCommandFSA,
                                initialState: new DeluxeInMemoryStore({
                                    [categorizableType]: [categorizableToTag],
                                    // The tag already applies to this categorizable (includes it as a member)
                                    [AggregateType.tag]: [
                                        tagToUpdate.clone({
                                            members: [categorizableToTag.getCompositeIdentifier()],
                                        }),
                                    ],
                                }).fetchFullSnapshotInLegacyFormat(),
                                systemUserId: dummySystemUserId,
                                checkError: (error: InternalError) => {
                                    assertErrorAsExpected(
                                        error,
                                        new CommandExecutionError([
                                            new DuplicateTagError(
                                                tagToUpdate.label,
                                                categorizableToTag.getCompositeIdentifier()
                                            ),
                                        ])
                                    );
                                },
                            });
                        });
                    });
                });
            });

            describe('when the command payload has an invalid type', () => {
                describe('when the aggregate composite identifier has an aggregate type other than tag', () => {
                    Object.values(AggregateType)
                        .filter((aggregateType) => aggregateType !== AggregateType.tag)
                        .forEach((aggregateType) => {
                            describe(`when the aggregate type is :${formatAggregateType(
                                aggregateType
                            )}`, () => {
                                it('should fail with the appropriate type error', async () => {
                                    await assertCommandFailsDueToTypeError(
                                        commandAssertionDependencies,
                                        {
                                            propertyName: 'aggregateCompositeIdentifier',
                                            invalidValue: {
                                                ...tagToUpdate.getCompositeIdentifier(),
                                                type: aggregateType,
                                            },
                                        },
                                        validCommandFSA
                                    );
                                });
                            });
                        });
                });

                generateCommandFuzzTestCases(TagResourceOrNote).forEach(
                    ({ description, propertyName, invalidValue }) => {
                        describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                            it('should fail with the appropriate error', async () => {
                                await assertCommandFailsDueToTypeError(
                                    commandAssertionDependencies,
                                    { propertyName, invalidValue },
                                    validCommandFSA
                                );
                            });
                        });
                    }
                );
            });
        });
});
