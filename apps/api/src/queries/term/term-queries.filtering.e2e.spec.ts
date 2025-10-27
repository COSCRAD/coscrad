/**
 * Note that we do not test the interaction of filtering with user access.
 * As such, this test uses public resources throughout.
 *
 * When we move ACL-based user access filtering to the database, we should
 * test this carefully. At that point, we may need to use an admin user for the
 * present test setup.
 */

import { HttpStatusCode, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { PaginationOptions } from '../../app/controllers/resources/term.controller';
import { TermModule } from '../../app/domain-modules/term.module';
import { MockJwtAuthGuard } from '../../authorization/mock-jwt-auth-guard';
import { OptionalJwtAuthGuard } from '../../authorization/optional-jwt-auth-guard';
import { buildMultilingualTextFromBilingualText } from '../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    ITermQueryRepository,
    TERM_QUERY_REPOSITORY_TOKEN,
} from '../../domain/models/term/queries';
import {
    CoscradAndCondition,
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradOrCondition,
    CoscradSimpleCondition,
} from '../../lib/coscrad-query-language/models/coscrad-filter-condition';
import { ArangoDatabaseProvider } from '../../persistence/database/database.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../test-data/utilities';
import { TermViewModel } from '../buildViewModelForResource/viewModels/term.view-model';
import { VocabularyListViewModel } from '../buildViewModelForResource/viewModels/vocabulary-list.view-model';

const searchTermsWithNoSpecialChar = 'aba';

const termWhoseEnglishMatchesSearch = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(1),
    /**
     * The search term matches the english
     */
    name: buildMultilingualTextWithSingleItem(`b${searchTermsWithNoSpecialChar}`),
});

const termThatShouldMatchNoSearches = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(2),
    name: buildMultilingualTextWithSingleItem(`@#$%^`),
});

const indexEndpoint = `/resources/terms`;

describe(`term index queries`, () => {
    let app: INestApplication;

    let termRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    const assertFilterWorks = async ({
        matches,
        nonMatches,
        filter,
        pagination,
    }: {
        matches: TermViewModel[];
        nonMatches: TermViewModel[];
        filter: CoscradFilterCondition;
        pagination?: PaginationOptions;
    }) => {
        // Arrange
        await termRepository.createMany([...matches, ...nonMatches]);

        // Act
        const res = await request(app.getHttpServer()).post(indexEndpoint).send({
            filter,
            pagination,
        });

        // Assert
        expect(res.status).toBe(HttpStatusCode.createdResource);

        const { entities } = res.body;

        // TODO should we tighten up this check?
        expect(entities).toHaveLength(matches.length);
    };

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                TermModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .overrideGuard(OptionalJwtAuthGuard)
            .useValue(new MockJwtAuthGuard(undefined, true))
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        termRepository = app.get(TERM_QUERY_REPOSITORY_TOKEN);

        databaseProvider = app.get(ArangoDatabaseProvider);

        databaseProvider.clearViews();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when no filters are provided`, () => {
        it(`should return the expected result`, async () => {
            // Arrange
            const allTerms = [termThatShouldMatchNoSearches, termWhoseEnglishMatchesSearch];

            await termRepository.createMany(allTerms);

            // Act
            const res = await request(app.getHttpServer()).get(indexEndpoint);

            // Assert
            /**
             * We don't really want a 201. This post has no effect on the state.
             * But we have to use a `POST` to send the user-defined filters
             * as part of the (encrypted) body instead of (in the clear)
             * query parameters and respect REST semantics. As such, we
             * are returning a `201`.
             */
            expect(res.status).toBe(HttpStatusCode.createdResource);

            const { entities } = res.body;

            expect(entities).toHaveLength(allTerms.length);
        });
    });

    describe(`when user-defined filters are provided`, () => {
        describe(`when the provided filters are valid`, () => {
            describe(`when searching the property: **name**`, () => {
                describe(`when searching multilingual text for a search string`, () => {
                    describe(`when the number of results does not exceed the page size`, () => {
                        it(`should find the expected term`, async () => {
                            const multilingualTextIncludes: CoscradSimpleCondition = {
                                type: CoscradConditionBlockType.SIMPLE,
                                operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                                field: 'name',
                                params: [searchTermsWithNoSpecialChar],
                            };

                            await assertFilterWorks({
                                matches: [termWhoseEnglishMatchesSearch],
                                nonMatches: [termThatShouldMatchNoSearches],
                                filter: multilingualTextIncludes,
                            });
                        });
                    });

                    describe(`when the number of results exceeds the page size`, () => {
                        const keyword = 'hello';

                        const pageSize = 10;

                        const targetPage = 2;

                        const numberOfMatchingTerms = (targetPage + 1) * pageSize;

                        const matches = Array(numberOfMatchingTerms)
                            .fill(null)
                            .map((_, index) =>
                                buildTestInstance(TermViewModel, {
                                    id: buildDummyUuid(index),
                                    name: buildMultilingualTextWithSingleItem(keyword),
                                })
                            );

                        const nonMatches = Array(numberOfMatchingTerms)
                            .fill(null)
                            .map((_, index) =>
                                buildTestInstance(TermViewModel, {
                                    id: buildDummyUuid(100 + index),
                                    name: buildMultilingualTextWithSingleItem('zrzrzr'),
                                })
                            );

                        const doesTextInclude: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                            params: [keyword],
                            field: 'name',
                        };

                        /**
                         * This test case tests the interaction of filtering with
                         * pagination. We should have a seaprate test suite that
                         * tests filtering in isolation.
                         */
                        it(`should return a single page worth of results`, async () => {
                            // Arrange
                            await termRepository.createMany([...matches, ...nonMatches]);

                            // Act
                            const res = await request(app.getHttpServer())
                                .post(indexEndpoint)
                                .send({
                                    filter: doesTextInclude,
                                    pagination: {
                                        size: pageSize,
                                        page: targetPage,
                                    },
                                });

                            // Assert
                            expect(res.status).toBe(HttpStatusCode.createdResource);

                            const { entities } = res.body;

                            expect(entities).toHaveLength(pageSize);
                        });
                    });
                });

                describe(`when searching multilingual text for a language-specific character`, () => {
                    const buildTokenFromLetters = (letters: string[]) => ({
                        text: letters.join(''),
                        languageCode: LanguageCode.Chilcotin,
                        /**
                         * Note that if `isSpace` and `isPunct` are false, the `symbols` array will
                         * be a list of the atomic letters for the given alphabet, which may use
                         * multiple unicode symbols to indicate one letter.
                         */
                        characters: letters.map((l) => ({
                            text: l,
                            isPunctuationOrWhiteSpace: false,
                            isOutOfAlphabet: false,
                            isUpperCase: false,
                        })),
                        /**
                         * Eventually, we would like to move our NLP to spacy. We are staying
                         * close to their API for that reason.
                         */
                        isSpace: false,
                        isPunct: false,
                        isStop: false,
                    });

                    it(`should find the expected results`, async () => {
                        const letterToFind = 'ts';

                        const targetLanguage = LanguageCode.Chilcotin;

                        const termWithLetterInOnlyWord = buildTestInstance(TermViewModel, {
                            id: buildDummyUuid(1),
                            tokens: [buildTokenFromLetters([letterToFind, 'a'])],
                        });

                        const termWithLetterInSecondWord = buildTestInstance(TermViewModel, {
                            id: buildDummyUuid(2),
                            tokens: [
                                buildTokenFromLetters(['g', 'u', 'y', 'i']),
                                buildTokenFromLetters([letterToFind, 'a']),
                            ],
                        });

                        const termWithoutLetter = buildTestInstance(TermViewModel, {
                            id: buildDummyUuid(3),
                            tokens: [buildTokenFromLetters(['d', 'e', 'ʔ', 'a', 'x'])],
                        });

                        const multilingualTextIncludesLetter: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                            field: 'tokens',
                            params: [letterToFind, targetLanguage],
                        };

                        await assertFilterWorks({
                            matches: [termWithLetterInOnlyWord, termWithLetterInSecondWord],
                            nonMatches: [termWithoutLetter],
                            filter: multilingualTextIncludesLetter,
                        });
                    });
                });
            });

            describe(`when searching the property: audioURL`, () => {
                const termWithAudio = buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(1),
                    mediaItemId: buildDummyUuid(55),
                });

                const termWithoutAudio = buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(2),
                    // this term does not yet have audio
                    // mediaItemId: null
                });

                const hasAudio: CoscradSimpleCondition = {
                    type: CoscradConditionBlockType.SIMPLE,
                    operator: CoscradBooleanOperator.HAS_PROPERTY,
                    params: [],
                    // Note that this is built in the service layer using the config for the base URL, but corresponding media item IDs are persisted in the query DB
                    field: 'mediaItemId',
                };

                it(`should return the expected result`, async () => {
                    await assertFilterWorks({
                        matches: [termWithAudio],
                        nonMatches: [termWithoutAudio],
                        filter: hasAudio,
                    });
                });
            });

            describe(`when searching the property: vocabularyLists`, () => {
                const searchText = 'Fruit';

                const termInVocabularyListWithMatchingName = buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(1),
                    vocabularyLists: [
                        buildTestInstance(VocabularyListViewModel, {
                            name: buildMultilingualTextFromBilingualText(
                                {
                                    text: 'not me',
                                    languageCode: LanguageCode.English,
                                },
                                {
                                    text: `This matches, though. ${searchText}`,
                                    languageCode: LanguageCode.Chilcotin,
                                }
                            ),
                        }),
                    ],
                });

                const termInSeveralVocabularyListsWithOneMatchingName = buildTestInstance(
                    TermViewModel,
                    {
                        id: buildDummyUuid(2),
                        vocabularyLists: [
                            buildTestInstance(VocabularyListViewModel, {
                                name: buildMultilingualTextWithSingleItem(
                                    `This one matches. ${searchText}`
                                ),
                            }),
                            buildTestInstance(VocabularyListViewModel, {
                                name: buildMultilingualTextWithSingleItem('I do not match.'),
                            }),
                        ],
                    }
                );

                const termWithNoVocabularyLists = buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(3),
                    vocabularyLists: [],
                });

                const termWithNoMatchingNames = buildTestInstance(TermViewModel, {
                    id: buildDummyUuid(4),
                    vocabularyLists: [
                        buildTestInstance(VocabularyListViewModel, {
                            name: buildMultilingualTextWithSingleItem('I do not match!'),
                        }),
                        buildTestInstance(VocabularyListViewModel, {
                            name: buildMultilingualTextWithSingleItem(
                                'I do not match either.',
                                LanguageCode.Chilcotin
                            ),
                        }),
                    ],
                });

                const vocabularyListNameIncludes: CoscradSimpleCondition = {
                    type: CoscradConditionBlockType.SIMPLE,
                    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                    field: 'vocabularyLists[*].name',
                    params: [searchText],
                };

                it(`should return the expected result`, async () => {
                    await assertFilterWorks({
                        matches: [
                            termInSeveralVocabularyListsWithOneMatchingName,
                            termInVocabularyListWithMatchingName,
                        ],
                        nonMatches: [termWithNoMatchingNames, termWithNoVocabularyLists],
                        filter: vocabularyListNameIncludes,
                    });
                });
            });
        });

        describe(`when one of the provided filters has an invalid path`, () => {
            describe(`when a top level superfluous property is provided`, () => {
                it(`should return the expected error`, async () => {
                    const invalidFilter: CoscradSimpleCondition = {
                        type: CoscradConditionBlockType.SIMPLE,
                        operator: CoscradBooleanOperator.TEXT_EQUALS,
                        field: 'bogus',
                        params: ['match me'],
                    };

                    const res = await request(app.getHttpServer()).post(indexEndpoint).send({
                        filter: invalidFilter,
                    });

                    expect(res.status).toBe(HttpStatusCode.badRequest);

                    const { message } = res.body;

                    expect(message).toContain(`You've really dropped the ball this time, Aaron.`);
                });
            });

            describe(`when a top level primitive property is referenced erroneously as an array`, () => {
                const validNonArrayProperty = 'mediaItemIdForVideo';

                const invalidFilter: CoscradSimpleCondition = {
                    type: CoscradConditionBlockType.SIMPLE,
                    operator: CoscradBooleanOperator.TEXT_EQUALS,
                    field: `${validNonArrayProperty}[*]`,
                    params: ['match me'],
                };

                const validFilter: CoscradSimpleCondition = {
                    type: CoscradConditionBlockType.SIMPLE,
                    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                    field: 'name',
                    params: ['match me'],
                };

                const invalidAndFilter: CoscradAndCondition = {
                    type: CoscradConditionBlockType.AND,
                    conditions: [invalidFilter, validFilter],
                };

                it(`should return the expected error`, async () => {
                    const res = await request(app.getHttpServer()).post(indexEndpoint).send({
                        filter: invalidAndFilter,
                    });

                    expect(res.status).toBe(HttpStatusCode.badRequest);

                    const { message } = res.body;

                    expect(message).toContain(invalidFilter.field);
                });
            });

            describe(`when a deeply nested superfluous property is provided`, () => {
                const invalidFilter: CoscradSimpleCondition = {
                    type: CoscradConditionBlockType.SIMPLE,
                    operator: CoscradBooleanOperator.HAS_PROPERTY,
                    field: 'tokens[*].characters[*].isPunctuationOrWhiteSpace.count',
                    params: [],
                };

                const invalidOrFilter: CoscradOrCondition = {
                    type: CoscradConditionBlockType.OR,
                    conditions: [invalidFilter],
                };

                it(`should return the expected error response`, async () => {
                    const res = await request(app.getHttpServer()).post(indexEndpoint).send({
                        filter: invalidOrFilter,
                    });

                    expect(res.status).toBe(HttpStatusCode.badRequest);

                    const { message } = res.body;

                    expect(message).toContain(`isPunctuationOrWhiteSpace`);

                    expect(message).toContain('count');
                });
            });
        });
    });
});
