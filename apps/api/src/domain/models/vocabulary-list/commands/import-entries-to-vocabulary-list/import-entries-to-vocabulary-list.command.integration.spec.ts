import { AggregateType, DropboxOrCheckbox, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import {
    VocabularyList,
    VocabularyListEntryImportItem,
} from '../../entities/vocabulary-list.entity';
import { VocabularyListEntry } from '../../vocabulary-list-entry.entity';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

const commandType = 'IMPORT_ENTRIES_TO_VOCABULARY_LIST';

const dummyTerm = getValidAggregateInstanceForTest(AggregateType.term);

const termsToImport = [117, 118, 119].map((sequentialId) =>
    dummyTerm.clone({
        id: buildDummyUuid(sequentialId),
        text: buildMultilingualTextWithSingleItem(`text for term ${sequentialId}`),
        eventHistory: dummyTerm.eventHistory.map((e, index) => ({
            ...e,
            id: buildDummyUuid(sequentialId * 10 + index),
            payload: {
                ...e.payload,
                aggregateCompositeIdentifier: {
                    type: AggregateType.term,
                    id: buildDummyUuid(sequentialId * 10 + index),
                },
            },
        })),
    })
);

const allowedValuesForPersonProperty = ['11', '21', '31'];

const entries: VocabularyListEntryImportItem[] = allowedValuesForPersonProperty.map(
    (value, index) => ({
        termId: termsToImport[index].id,
        propertyValues: {
            person: value,
            positive: true,
        },
    })
);

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        published: false,
        entries: [],
        variables: [
            {
                name: 'person',
                type: DropboxOrCheckbox.dropbox,
                validValues: allowedValuesForPersonProperty.map((value) => ({
                    value,
                    display: `label for ${value}`,
                })),
            },
            {
                name: 'positive',
                type: DropboxOrCheckbox.checkbox,
                validValues: [
                    {
                        value: true,
                        display: 'positive',
                    },
                    {
                        value: false,
                        display: 'negative',
                    },
                ],
            },
        ],
    }
);

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<ImportEntriesToVocabularyList>;

const aggregateCompositeIdentifier = existingVocabularyList.getCompositeIdentifier();

const commandFsaFactory = new DummyCommandFsaFactory<ImportEntriesToVocabularyList>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            entries,
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

    describe(`when the command is valid`, () => {
        it(`should succeed`, async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA: () => commandFsaFactory.build(),
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .create(existingVocabularyList);

                    await testRepositoryProvider
                        .forResource(ResourceType.term)
                        .createMany(termsToImport)
                        .catch((e) => {
                            throw new InternalError(`${e}`);
                        });
                },
                checkStateOnSuccess: async () => {
                    const vocabularyListSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchById(aggregateCompositeIdentifier.id);

                    expect(vocabularyListSearchResult).toBeInstanceOf(VocabularyList);

                    const updatedVocabularyList = vocabularyListSearchResult as VocabularyList;

                    const missingEntries = entries.filter(({ termId, propertyValues }) => {
                        if (!updatedVocabularyList.hasEntryForTerm(termId)) return true;

                        const entryForTerm = updatedVocabularyList.getEntryForTerm(
                            termId
                        ) as VocabularyListEntry;

                        return !entryForTerm.doesMatchAll(propertyValues);
                    });

                    expect(missingEntries).toEqual([]);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when one of the terms is missing`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider
                            .forResource(ResourceType.vocabularyList)
                            .create(existingVocabularyList);

                        await testRepositoryProvider
                            .forResource(ResourceType.term)
                            // we skip adding the 0th term to the database
                            .createMany(termsToImport.slice(1))
                            .catch((e) => {
                                throw new InternalError(`${e}`);
                            });
                    },
                    buildCommandFSA: () => commandFsaFactory.build(),
                });
            });
        });
    });
});
