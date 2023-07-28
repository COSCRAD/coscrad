import { LanguageCode } from '@coscrad/api-interfaces';
import { isString } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Song } from '../../../domain/models/song/song.entity';
import { AggregateType } from '../../../domain/types/AggregateType';
import { InternalError } from '../../../lib/errors/InternalError';
import { NotFound } from '../../../lib/types/not-found';
import clonePlainObjectWithoutProperty from '../../../lib/utilities/clonePlainObjectWithoutProperty';
import { DTO } from '../../../types/DTO';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import mapEntityDTOToDatabaseDTO, {
    ArangoDatabaseDocument,
} from '../../database/utilities/mapEntityDTOToDatabaseDTO';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import { MigrateBilingualSongs } from './migrate-bilingual-songs.migration';

const migrationUnderTest = new MigrateBilingualSongs();

type NewSongDto = DTO<Song>;

type OldSongDto = DTO<
    Omit<NewSongDto, 'title'> & {
        title: string;
        titleEnglish: string;
    }
>;

const dummySongDto = getValidAggregateInstanceForTest(AggregateType.song).toDTO();

const dummySongDtoWithoutNewProperty = clonePlainObjectWithoutProperty(dummySongDto, 'title');

const languageOnlyText = 'I am only named in the language';

const englishOnlyText = 'I am only named in English';

const songWithNoEnglish = {
    ...dummySongDtoWithoutNewProperty,
    title: languageOnlyText,
    id: buildDummyUuid(220),
};

const songWithNoNameInLanguage = {
    ...dummySongDtoWithoutNewProperty,
    titleEnglish: englishOnlyText,
    id: buildDummyUuid(221),
};

// @ts-expect-error fix me
const oldSongDocuments: ArangoDatabaseDocument<OldSongDto>[] = Array(7)
    .fill(null)
    .map((_, index) => ({
        ...dummySongDtoWithoutNewProperty,
        title: `title [${index}]`,
        titleEnglish: `titleEnglish: [${index + 200}]`,
    }))
    .map((doc, index) => ({
        ...doc,
        // here we ensure unique IDs
        id: buildDummyUuid(index + 200),
    }))
    .concat([songWithNoEnglish, songWithNoNameInLanguage])
    .map(mapEntityDTOToDatabaseDTO);

const languageCodeEquals =
    (languageCodeToFind: LanguageCode) =>
    ({ languageCode }: { languageCode: LanguageCode }) =>
        languageCodeToFind === languageCode;

describe(`MigrateBilingualTermsAndVocabularyLists`, () => {
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
         * setup and teardown logic at this level for the purpose of commadn and
         * query integration tests. So instead of rewriting this logic on a
         * `TestDatabaseProvider`, we will just leverage this existing logic for
         * test teardown.
         */
        testRepositoryProvider = new TestRepositoryProvider(testDatabaseProvider);

        testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when migrating songs`, () => {
        beforeEach(async () => {
            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.songs)
                .createMany(oldSongDocuments);
        });

        it(`should update the documents as expected`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const vocabularyListDocuments = await testDatabaseProvider
                .getDatabaseForCollection<NewSongDto>(ArangoCollectionId.songs)
                .fetchMany();

            const invalidDocuments = (vocabularyListDocuments as unknown as OldSongDto[]).filter(
                ({ title, titleEnglish }) => isString(title) || isString(titleEnglish)
            );

            expect(invalidDocuments).toEqual([]);

            /**
             * Here we validate manually the song with text in the language only.
             */
            const songWithNoEnglishSearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.songs)
                .fetchById(songWithNoEnglish.id);

            expect(songWithNoEnglishSearchResult).not.toBe(NotFound);

            expect(songWithNoEnglishSearchResult).not.toBeInstanceOf(InternalError);

            const { title } = songWithNoEnglishSearchResult as ArangoDatabaseDocument<DTO<Song>>;

            const textInLanguage = title.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            )?.text;

            expect(textInLanguage).toBe(languageOnlyText);

            const textInEnglish = title.items.find(languageCodeEquals(LanguageCode.English));

            expect(textInEnglish).toBe(undefined);

            /**
             * Here we validate manually the song with text in English only.
             */
            const songWithEnglishOnlySearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.songs)
                .fetchById(songWithNoNameInLanguage.id);

            expect(songWithEnglishOnlySearchResult).not.toBe(NotFound);

            expect(songWithEnglishOnlySearchResult).not.toBeInstanceOf(InternalError);

            const songWithEnglishOnly = songWithEnglishOnlySearchResult as ArangoDatabaseDocument<
                DTO<Song>
            >;

            const englishOnlyTextResult = songWithEnglishOnly.title.items.find(
                languageCodeEquals(LanguageCode.English)
            )?.text;

            expect(englishOnlyTextResult).toBe(englishOnlyText);

            const shouldBeMissingLanguagetext = songWithEnglishOnly.title.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            );

            expect(shouldBeMissingLanguagetext).toBe(undefined);
        });

        it(`should be reversible`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const songDocuments = await testDatabaseProvider
                .getDatabaseForCollection<OldSongDto>(ArangoCollectionId.songs)
                .fetchMany();

            const documentsWithoutAStringName = (
                songDocuments as unknown as (OldSongDto & NewSongDto)[]
            ).filter(
                ({ title, titleEnglish }) =>
                    // there was a title property to start with, but it used to be a string
                    !isString(title) && !isString(titleEnglish)
            );

            expect(documentsWithoutAStringName).toEqual([]);
        });
    });
});
