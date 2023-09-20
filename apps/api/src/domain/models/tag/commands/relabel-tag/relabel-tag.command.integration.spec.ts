import { AggregateType, FluxStandardAction } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import buildTestDataInFlatFormat from '../../../../../test-data/buildTestDataInFlatFormat';
import TagLabelAlreadyInUseError from '../../../../domainModelValidators/errors/tag/TagLabelAlreadyInUseError';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { Tag } from '../../tag.entity';
import { RelabelTag } from './relabel-tag.command';

const commandType = 'RELABEL_TAG';

const testData = buildTestDataInFlatFormat();

const otherTags: Tag[] = testData.tag as Tag[];

const tagToRelabel = otherTags[0].clone<Tag>({
    id: dummyUuid,
    label: 'short-lived label',
});

const initialState = new DeluxeInMemoryStore({
    tag: [...otherTags, tagToRelabel],
}).fetchFullSnapshotInLegacyFormat();

const newLabel = 'uniqueLABEL24';

const tagWithLabelCollision = otherTags[1];

const validFSA: FluxStandardAction<RelabelTag> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: tagToRelabel.getCompositeIdentifier(),
        newLabel,
    },
};

const buildValidCommandFSA = () => validFSA;

const dummyFsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

describe('RELABEL_TAG', () => {
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

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                buildValidCommandFSA,
                initialState,
                systemUserId: dummySystemUserId,
                checkStateOnSuccess: async ({
                    newLabel,
                    aggregateCompositeIdentifier: { id },
                }: RelabelTag) => {
                    const updatedTagSearchResult = await testRepositoryProvider
                        .getTagRepository()
                        .fetchById(id);

                    expect(updatedTagSearchResult).not.toBe(NotFound);

                    expect(updatedTagSearchResult).not.toBeInstanceOf(InternalError);

                    const updatedTag = updatedTagSearchResult as Tag;

                    expect(updatedTag.label).toEqual(newLabel);

                    assertEventRecordPersisted(updatedTag, 'TAG_RELABELLED', dummySystemUserId);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when there is an existing tag with the new label', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(
                    commandAssertionDependencies,

                    {
                        initialState,
                        systemUserId: dummySystemUserId,
                        buildCommandFSA: () =>
                            dummyFsaFactory.build(tagToRelabel.id, {
                                newLabel: tagWithLabelCollision.label,
                            }),
                        checkError: (error: InternalError) => {
                            assertErrorAsExpected(
                                error,
                                new CommandExecutionError([
                                    new InvalidExternalStateError([
                                        new TagLabelAlreadyInUseError(
                                            tagWithLabelCollision.label,
                                            tagWithLabelCollision.id
                                        ),
                                    ]),
                                ])
                            );
                        },
                    }
                );
            });
        });

        describe('when there is no tag with the given ID', () => {
            it('should fail with the expected error', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    buildCommandFSA: buildValidCommandFSA,
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.tag]: otherTags,
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error: InternalError) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(tagToRelabel.getCompositeIdentifier()),
                            ])
                        );
                    },
                });
            });
        });

        describe('when the payload has an invalid type', () => {
            describe('when the aggregate type is wrong', () => {
                it('should fail with the appropriate error', async () => {
                    await assertCommandFailsDueToTypeError(
                        commandAssertionDependencies,
                        {
                            propertyName: 'aggregateCompositeIdentifier',
                            invalidValue: {
                                type: AggregateType.note,
                                id: validFSA.payload.aggregateCompositeIdentifier.id,
                            },
                        },
                        buildValidCommandFSA()
                    );
                });
            });

            generateCommandFuzzTestCases(RelabelTag).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA()
                            );
                        });
                    });
                }
            );
        });
    });
});
