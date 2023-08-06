import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { doesDeepAnyPropertyEqual } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { CoscradEventFactory } from '../../../domain/common';
import { AudioItem } from '../../../domain/models/audio-item/entities/audio-item.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { HasAggregateId } from '../../../domain/types/HasAggregateId';
import { DTO } from '../../../types/DTO';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import { DatabaseDTO } from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import { UpdateEnglishLanguageCode } from './update-english-language-code.migration';

describe(`UpdateEnglishLanguageCode`, () => {
    let testDatabaseProvider: ArangoDatabaseProvider;

    let testQueryRunner: ArangoQueryRunner;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        const testModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider = testModule.get(ArangoConnectionProvider);

        testDatabaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        /**
         * It's a bit awkward that we need this because we are not working at
         * the repositories level of abstraction. However, we have added test
         * setup and teardown logic at this level for the purpose of command and
         * query integration tests. So instead of rewriting this logic on a
         * `TestDatabaseProvider`, we will just leverage this existing logic for
         * test teardown.
         */
        testRepositoryProvider = new TestRepositoryProvider(
            testDatabaseProvider,
            // We don't need the event factory for this test
            new CoscradEventFactory([])
        );

        testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
    });

    const oldInvalidMultilingualText = {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: `I have eng instead of en as my language code`,
                languageCode: 'eng' as LanguageCode,
            },
        ],
    };

    const oldInvalidMultilingualTextWithTranslation = {
        items: [
            {
                role: MultilingualTextItemRole.original,
                text: `I am ok`,
                languageCode: LanguageCode.Chilcotin,
            },
            {
                role: MultilingualTextItemRole.freeTranslation,
                text: `I have eng instead of en as my language code`,
                languageCode: 'eng' as LanguageCode,
            },
        ],
    };

    describe(`when there is data to migrate`, () => {
        const dummyAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

        const audioItemWithOldFormat = dummyAudioItem.clone({
            name: oldInvalidMultilingualText,
            transcript: dummyAudioItem.transcript.clone({
                items: dummyAudioItem.transcript.items.map((item) => ({
                    ...item,
                    text: oldInvalidMultilingualTextWithTranslation,
                })),
            }),
        });

        const audioItemsWithOldFormat = [audioItemWithOldFormat];

        beforeEach(async () => {
            await testRepositoryProvider.testTeardown();

            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.audio_items)
                .createMany(audioItemsWithOldFormat as unknown as DatabaseDTO<HasAggregateId>[]);
        });

        const migrationUnderTest = new UpdateEnglishLanguageCode();

        it(`should apply the appropriate updates`, async () => {
            const originalDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.audio_items)
                .fetchMany()) as unknown as DatabaseDTO<DTO<AudioItem>>[];

            await migrationUnderTest.up(testQueryRunner);

            const updatedAudioDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.audio_items)
                .fetchMany()) as unknown as DatabaseDTO<DTO<AudioItem>>[];

            const invalidDocuments = updatedAudioDocuments.filter(doesDeepAnyPropertyEqual('eng'));

            expect(invalidDocuments).toEqual([]);

            expect(originalDocuments).not.toEqual(updatedAudioDocuments);
        });

        it(`should be reversible`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const updatedAudioDocuments = (await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.audio_items)
                .fetchMany()) as unknown as DatabaseDTO<DTO<AudioItem>>[];

            const invalidDocuments = updatedAudioDocuments.filter(
                doesDeepAnyPropertyEqual(LanguageCode.English)
            );

            expect(invalidDocuments).toEqual([]);
        });
    });
});
