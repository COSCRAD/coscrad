import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { NotFound } from '../../../../../lib/types/not-found';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { TranslateVocabularyListName } from './translate-vocabulary-list-name.command';

const commandType = 'TRANSLATE_VOCABULARY_LIST_NAME';

const existingVocabularyList = getValidAggregateInstanceForTest(AggregateType.vocabularyList).clone(
    {
        name: new MultilingualText({
            items: [
                new MultilingualTextItem({
                    text: 'orignal name of the vocabulary list',
                    role: MultilingualTextItemRole.original,
                    languageCode: LanguageCode.Chilcotin,
                }),
            ],
        }),
    }
);

const englishName = 'vocabulary list name translated to English';

const validPayload: TranslateVocabularyListName = {
    aggregateCompositeIdentifier: {
        type: AggregateType.vocabularyList,
        id: existingVocabularyList.id,
    },
    languageCode: LanguageCode.English,
    text: englishName,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<TranslateVocabularyListName>> =>
    validCommandFSA;

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
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

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCommandSuccess(commandAssertionDependencies, {
                systemUserId: dummySystemUserId,
                buildValidCommandFSA,
                initialState: new DeluxeInMemoryStore({
                    [AggregateType.vocabularyList]: [existingVocabularyList],
                }).fetchFullSnapshotInLegacyFormat(),
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id: vocabularyListId },
                }: TranslateVocabularyListName) => {
                    const vocabularyListSearchResult = await testRepositoryProvider
                        .forResource(ResourceType.vocabularyList)
                        .fetchById(vocabularyListId);

                    expect(vocabularyListSearchResult).not.toBe(NotFound);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the vocabulary list name already has a translation in the target language', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: buildValidCommandFSA,
                    initialState: new DeluxeInMemoryStore({}),
                });
            });
        });
    });
});
