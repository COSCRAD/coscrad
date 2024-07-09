import { LanguageCode } from '@coscrad/api-interfaces';
import { isNullOrUndefined, isString } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
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
    DatabaseDTO,
} from '../../database/utilities/mapEntityDTOToDatabaseDocument';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import { MigrateBilingualTermsAndVocabularyLists } from './migrate-bilingual-terms-and-vocabulary-lists.migration';

const migrationUnderTest = new MigrateBilingualTermsAndVocabularyLists();

/**
 * Terms
 */
type NewTermDto = DTO<Term>;

type OldTermDto = DTO<
    Omit<Term, 'text'> & {
        term: string;
        termEnglish: string;
    }
>;

const dummyTermDto = getValidAggregateInstanceForTest(AggregateType.term).toDTO();

const dummyTermDtoWithoutNewProperty = clonePlainObjectWithoutProperty(dummyTermDto, 'text');

const languageOnlyText = `I have no text in English`;

const englishOnlyText = `I have no text in the language`;

const termWithNoEnglish = {
    ...dummyTermDtoWithoutNewProperty,
    term: languageOnlyText,
    id: buildDummyUuid(101),
};

const termWithNoTextInLanguage = {
    ...dummyTermDtoWithoutNewProperty,
    termEnglish: englishOnlyText,
    id: buildDummyUuid(102),
};

// @ts-expect-error fix me
const oldTermDocuments: DatabaseDTO<OldTermDto>[] = Array(10)
    .fill(null)
    .map((_, index) => ({
        ...dummyTermDtoWithoutNewProperty,
        term: `term [${index}]`,
        termEnglish: `termEnglish: [${index}]`,
    }))
    .map((doc, index) => ({
        ...doc,
        // here we ensure unique IDs
        id: buildDummyUuid(index),
    }))
    .concat([termWithNoEnglish, termWithNoTextInLanguage])
    .map(mapEntityDTOToDatabaseDTO);

/**
 * VocabularyLists
 */
type NewVocabularyListDto = DTO<VocabularyList>;

type OldVocabularyListDto = DTO<
    Omit<VocabularyList, 'name'> & {
        name: string;
        nameEnglish: string;
    }
>;

const dummyVocabularyListDto = getValidAggregateInstanceForTest(
    AggregateType.vocabularyList
).toDTO();

const dummyVocabularyListDtoWithoutNewProperty = clonePlainObjectWithoutProperty(
    dummyVocabularyListDto,
    'name'
);

const vocabularyListWithNoEnglish = {
    ...dummyVocabularyListDtoWithoutNewProperty,
    name: languageOnlyText,
    id: buildDummyUuid(220),
};

const vocabularyListWithNoNameInLanguage = {
    ...dummyVocabularyListDtoWithoutNewProperty,
    nameEnglish: englishOnlyText,
    id: buildDummyUuid(221),
};

// @ts-expect-error fix me
const oldVocabularyListDocuments: ArangoDatabaseDocument<OldVocabularyListDto>[] = Array(7)
    .fill(null)
    .map((_, index) => ({
        ...dummyVocabularyListDtoWithoutNewProperty,
        name: `name [${index}]`,
        nameEnglish: `nameEnglish: [${index + 200}]`,
    }))
    .map((doc, index) => ({
        ...doc,
        // here we ensure unique IDs
        id: buildDummyUuid(index + 200),
    }))
    .concat([vocabularyListWithNoEnglish, vocabularyListWithNoNameInLanguage])
    .map(mapEntityDTOToDatabaseDTO);

const languageCodeEquals =
    (languageCodeToFind: LanguageCode) =>
    ({ languageCode }: { languageCode: LanguageCode }) =>
        languageCodeToFind === languageCode;

// This migration has already been applied
describe.skip(`MigrateBilingualTermsAndVocabularyLists`, () => {
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

        testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when migrating terms`, () => {
        beforeEach(async () => {
            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .createMany(oldTermDocuments);
        });

        it(`should update the documents as expected`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const termDocuments = await testDatabaseProvider
                .getDatabaseForCollection<NewTermDto>(ArangoCollectionId.terms)
                .fetchMany();

            const invalidDocuments = (termDocuments as unknown as OldTermDto[]).filter(
                ({ term, termEnglish }) => isString(term) || isString(termEnglish)
            );

            expect(invalidDocuments).toEqual([]);

            /**
             * Here we validate manually the term with text in the language only.
             */
            const termWithNoEnglishSearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchById(termWithNoEnglish.id);

            expect(termWithNoEnglishSearchResult).not.toBe(NotFound);

            expect(termWithNoEnglishSearchResult).not.toBeInstanceOf(InternalError);

            const { text } = termWithNoEnglishSearchResult as ArangoDatabaseDocument<DTO<Term>>;

            const textInLanguage = text.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            )?.text;

            expect(textInLanguage).toBe(languageOnlyText);

            const textInEnglish = text.items.find(languageCodeEquals(LanguageCode.English));

            expect(textInEnglish).toBe(undefined);

            /**
             * Here we validate manually the term with text in English only.
             */
            const termWithEnglishOnlySearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.terms)
                .fetchById(termWithNoTextInLanguage.id);

            expect(termWithEnglishOnlySearchResult).not.toBe(NotFound);

            expect(termWithEnglishOnlySearchResult).not.toBeInstanceOf(InternalError);

            const { text: textForEnglishOnlyTerm } =
                termWithEnglishOnlySearchResult as ArangoDatabaseDocument<DTO<Term>>;

            const englishOnlyTextResult = textForEnglishOnlyTerm.items.find(
                languageCodeEquals(LanguageCode.English)
            )?.text;

            expect(englishOnlyTextResult).toBe(englishOnlyText);

            const shouldBeMissingLanguagetext = textForEnglishOnlyTerm.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            );

            expect(shouldBeMissingLanguagetext).toBe(undefined);
        });

        it(`should be reversible`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const termDocuments = await testDatabaseProvider
                .getDatabaseForCollection<OldTermDto>(ArangoCollectionId.terms)
                .fetchMany();

            const invalidDocuments = (
                termDocuments as unknown as (OldTermDto & NewTermDto)[]
            ).filter(
                ({ term, termEnglish, text }) =>
                    !isNullOrUndefined(text) ||
                    (isNullOrUndefined(term) && isNullOrUndefined(termEnglish))
            );

            expect(invalidDocuments).toEqual([]);
        });
    });

    describe(`when migrating vocabulary_lists`, () => {
        beforeEach(async () => {
            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.vocabulary_lists)
                .createMany(oldVocabularyListDocuments);
        });

        it(`should update the documents as expected`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const vocabularyListDocuments = await testDatabaseProvider
                .getDatabaseForCollection<NewVocabularyListDto>(ArangoCollectionId.vocabulary_lists)
                .fetchMany();

            const invalidDocuments = (
                vocabularyListDocuments as unknown as OldVocabularyListDto[]
            ).filter(({ name, nameEnglish }) => isString(name) || isString(nameEnglish));

            expect(invalidDocuments).toEqual([]);

            /**
             * Here we validate manually the term with text in the language only.
             */
            const vocabularyListWithNoEnglishSearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.vocabulary_lists)
                .fetchById(vocabularyListWithNoEnglish.id);

            expect(vocabularyListWithNoEnglishSearchResult).not.toBe(NotFound);

            expect(vocabularyListWithNoEnglishSearchResult).not.toBeInstanceOf(InternalError);

            const { name } = vocabularyListWithNoEnglishSearchResult as ArangoDatabaseDocument<
                DTO<VocabularyList>
            >;

            const textInLanguage = name.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            )?.text;

            expect(textInLanguage).toBe(languageOnlyText);

            const textInEnglish = name.items.find(languageCodeEquals(LanguageCode.English));

            expect(textInEnglish).toBe(undefined);

            /**
             * Here we validate manually the term with text in English only.
             */
            const vocabularyListWithEnglishOnlySearchResult = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.vocabulary_lists)
                .fetchById(vocabularyListWithNoNameInLanguage.id);

            expect(vocabularyListWithEnglishOnlySearchResult).not.toBe(NotFound);

            expect(vocabularyListWithEnglishOnlySearchResult).not.toBeInstanceOf(InternalError);

            const { name: nameForEnglishOnlyVocabularyList } =
                vocabularyListWithEnglishOnlySearchResult as ArangoDatabaseDocument<
                    DTO<VocabularyList>
                >;

            const englishOnlyTextResult = nameForEnglishOnlyVocabularyList.items.find(
                languageCodeEquals(LanguageCode.English)
            )?.text;

            expect(englishOnlyTextResult).toBe(englishOnlyText);

            const shouldBeMissingLanguagetext = nameForEnglishOnlyVocabularyList.items.find(
                languageCodeEquals(LanguageCode.Chilcotin)
            );

            expect(shouldBeMissingLanguagetext).toBe(undefined);
        });

        it(`should be reversible`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            await migrationUnderTest.down(testQueryRunner);

            const vocabularyListDocuments = await testDatabaseProvider
                .getDatabaseForCollection<OldTermDto>(ArangoCollectionId.vocabulary_lists)
                .fetchMany();

            const documentsWithoutAStringName = (
                vocabularyListDocuments as unknown as (OldVocabularyListDto &
                    NewVocabularyListDto)[]
            ).filter(
                ({ name, nameEnglish }) =>
                    // there was a name property to start with, but it used to be a string
                    !isString(name) && !isString(nameEnglish)
            );

            expect(documentsWithoutAStringName).toEqual([]);
        });
    });
});
