import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { ImportEntriesToVocabularyList } from './import-entries-to-vocabulary-list.command';

const commandType = 'IMPORT_ENTRIES_TO_VOCABULARY_LIST';

const termId = buildDummyUuid(117);

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        published: false,
        entries: [
            {
                termId,
                variableValues: {
                    person: '11',
                    positive: true,
                },
            },
        ],
        variables: [],
    }
);

const dummyFsa = buildTestCommandFsaMap().get(
    commandType
) as CommandFSA<ImportEntriesToVocabularyList>;

const aggregateCompositeIdentifier = {
    type: AggregateType.vocabularyList,
    id: termId,
};

const vocabularyListId = dummyFsa.payload.aggregateCompositeIdentifier.id;

const commandFsaFactory = new DummyCommandFsaFactory<ImportEntriesToVocabularyList>(() =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier,
            entries: [
                {
                    termId,
                    propertyValues: {},
                },
            ],
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
                buildValidCommandFSA: () =>
                    commandFsaFactory.build(undefined, {
                        aggregateCompositeIdentifier: {
                            id: vocabularyListId,
                        },
                        entries: {
                            termId,
                        },
                    }),
                seedInitialState: async () => {
                    await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .create(existingVocabularyList);
                },
                checkStateOnSuccess: async () => {
                    const vocabularyListSearchResult = await testRepositoryProvider
                        .getCategoryRepository()
                        .fetchById(vocabularyListId);
                },
            });
        });
    });
});
