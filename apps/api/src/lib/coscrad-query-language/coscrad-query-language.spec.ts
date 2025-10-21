import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/environment';
import { buildMultilingualTextFromBilingualText } from '../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { InternalError, isInternalError } from '../errors/InternalError';
import { Token } from '../nlp';
import { clonePlainObjectWithOverrides } from '../utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../utilities/cloneToPlainObject';
import {
    CoscradAndCondition,
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradNotCondition,
    CoscradSimpleCondition,
} from './models/coscrad-filter-condition';

const WIDGETS_COLLECTION_ID = 'widgets';

class Location {
    id: string;

    name: MultilingualText;

    constructor({ id, name }: DTO<Location>) {
        this.id = id;

        this.name = new MultilingualText(name);
    }
}

class Widget {
    id: string;

    comment: string;

    yearBuilt: number;

    description: MultilingualText;

    location?: Location;

    nickname?: string;

    rating?: number;

    tags: string[];

    tokens: Token[];

    constructor({
        id,
        yearBuilt,
        description,
        location,
        nickname,
        rating,
        tags,
        tokens,
        comment,
    }: DTO<Widget>) {
        this.id = id;

        this.yearBuilt = yearBuilt;

        if (isNonEmptyObject(description)) {
            this.description = new MultilingualText(description);
        }

        if (isNonEmptyObject(location)) {
            this.location = new Location(location);
        }

        this.nickname = nickname;

        this.rating = rating;

        this.tags = [...tags];

        this.comment = comment;

        this.tokens = tokens.map((t) => cloneToPlainObject(t));
    }

    clone(overrides?: DeepPartial<this>) {
        return new Widget(clonePlainObjectWithOverrides(this, overrides));
    }

    toDto() {
        return cloneToPlainObject(this);
    }
}

const dummyWidget = new Widget({
    id: '123',
    yearBuilt: 2023,
    description: buildMultilingualTextWithSingleItem('Awesome Widget'),
    tags: [],
    tokens: [],
    comment: 'an awesome widget indeed',
});

class WidgetRepository {
    private databaseForCollection: ArangoDatabaseForCollection<Widget>;

    constructor(arangoConnectionProvider: ArangoConnectionProvider) {
        this.databaseForCollection = new ArangoDatabaseForCollection(
            new ArangoDatabase(arangoConnectionProvider.getConnection()),
            WIDGETS_COLLECTION_ID
        );
    }

    async clear() {
        await this.databaseForCollection.clear();
    }

    async createMany(widgets: Widget[]) {
        await this.databaseForCollection.createMany(widgets.map(mapEntityDTOToDatabaseDocument));
    }

    async fetchForUser({ filter }: { filter: CoscradFilterCondition }) {
        const result = await this.databaseForCollection.fetchForUser({ filter });

        if (isInternalError(result)) {
            return result;
        }

        return result.map((doc) => new Widget(mapDatabaseDocumentToAggregateDTO(doc)));
    }
}

// GREATER_THAN
const cutoffYearExclusive = 2000;

const widgetThatComesAfterCutoffYear = dummyWidget.clone({
    id: '1',
    yearBuilt: cutoffYearExclusive + 1,
});

const widgetThatComesBeforeCutoffYear = dummyWidget.clone({
    id: '2',
    yearBuilt: cutoffYearExclusive - 1,
});

const greaterThanCutoffYear: CoscradSimpleCondition = {
    type: CoscradConditionBlockType.SIMPLE,
    operator: CoscradBooleanOperator.GREATER_THAN,
    params: [cutoffYearExclusive],
    field: 'yearBuilt',
};

// MULTILINGUAL_TEXT_INCLUDES
const searchText = 'ello';

const widgetThatMatchesInOriginalText = dummyWidget.clone({
    id: '1',
    description: buildMultilingualTextWithSingleItem(`H${searchText}`),
});

const widgetThatMatchesInTranslatedText = dummyWidget.clone({
    id: '2',
    description: buildMultilingualTextFromBilingualText(
        { text: 'no matchezz', languageCode: LanguageCode.English },
        {
            text: `H${searchText} World!`,
            languageCode: LanguageCode.Chilcotin,
        }
    ),
});

const widgetThatDoesNotMatchSearchText = dummyWidget.clone({
    id: '3',
    description: buildMultilingualTextWithSingleItem(`I don't match!`),
});

const doesAnyTextIncludeEllo: CoscradSimpleCondition = {
    type: CoscradConditionBlockType.SIMPLE,
    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
    field: 'description',
    params: [searchText],
};

const doesEnglishTextIncludeEllo: CoscradSimpleCondition = {
    type: CoscradConditionBlockType.SIMPLE,
    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
    field: 'description',
    params: [searchText, LanguageCode.English],
};

const dummyLocationName = buildMultilingualTextWithSingleItem('zzz', LanguageCode.Chilcotin);

/***
 * # Note about testing strategy
 * We want to maintain freedom to refactor the implementation as this evolves.
 * For that reason
 * 1. We are including our ArangoDB implementation in this test.
 * 2. We have introduced a toy model to avoid refactoring due to unrelated
 * domain model changes.
 */
describe(`Coscrad Query Language`, () => {
    let widgetRepository: WidgetRepository;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        const app = moduleRef.createNestApplication();

        await app.init();

        widgetRepository = new WidgetRepository(app.get(ArangoConnectionProvider));

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists(WIDGETS_COLLECTION_ID);
    });

    beforeEach(async () => {
        await widgetRepository.clear();
    });

    /**
     * A query may fail due to being ill-formatted. For example, the
     * paramers may be of the wrong type or number for the given operator.
     */

    const assertQueryError = async (
        filter: CoscradFilterCondition,
        expectedSnippetsInErrorMessage: string[]
    ) => {
        const result = await widgetRepository.fetchForUser({
            filter,
        });

        expect(result).toBeInstanceOf(InternalError);

        expect(expectedSnippetsInErrorMessage.length).toBeGreaterThan(0);

        const errorMessage = result.toString();

        expectedSnippetsInErrorMessage.forEach((snippet) => {
            expect(errorMessage.toLowerCase()).toContain(snippet.toLowerCase());
        });
    };

    describe(`when the query is validly formatted`, () => {
        describe(`when the query is a simple condition`, () => {
            describe(`when searching a nested field`, () => {
                describe(`MULTILINGUAL_TEXT_INCLUDES`, () => {
                    describe(`when the query is well-formed`, () => {
                        const targetLocationName = 'greenhouse';

                        const widgetWithTargetLocationName = dummyWidget.clone({
                            id: buildDummyUuid(1),
                            location: new Location({
                                id: buildDummyUuid(101),
                                name: buildMultilingualTextWithSingleItem(targetLocationName),
                            }),
                        });

                        const widgetWhoseLocationNameDoesntMatchTheFilter = dummyWidget.clone({
                            id: buildDummyUuid(2),
                            location: new Location({
                                id: buildDummyUuid(102),
                                name: buildMultilingualTextFromBilingualText(
                                    { text: 'zzz', languageCode: LanguageCode.English },
                                    { text: 'rrr', languageCode: LanguageCode.Chilcotin }
                                ),
                            }),
                        });

                        const nestedDoesMultilingualTextInclude: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                            field: 'location.name',
                            params: [targetLocationName],
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                widgetWithTargetLocationName,
                                widgetWhoseLocationNameDoesntMatchTheFilter,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: nestedDoesMultilingualTextInclude,
                            });

                            expect(result).toHaveLength(1);
                        });
                    });
                });
            });

            describe(`GREATER_THAN`, () => {
                describe(`when the query is well-formed`, () => {
                    beforeEach(async () => {
                        await widgetRepository.createMany([
                            widgetThatComesAfterCutoffYear,
                            widgetThatComesBeforeCutoffYear,
                        ]);
                    });

                    it(`should return the expected results`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: greaterThanCutoffYear,
                        });

                        expect(result).toHaveLength(1);
                    });
                });

                describe(`when the query is invalid`, () => {
                    describe(`when 0 parameters are provided`, () => {
                        it(`should return the expected error`, () => {
                            assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.GREATER_THAN,
                                    field: 'foo',
                                    params: [],
                                },
                                ['Expected 1 parameter, but received: 0']
                            );
                        });
                    });

                    describe(`when 2 parameters are provided`, () => {
                        it(`should return the expected error`, () => {
                            assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.GREATER_THAN,
                                    field: 'foo',
                                    params: [90, 100],
                                },
                                ['Expected 1 parameter, but received: 2']
                            );
                        });
                    });

                    describe(`when one parameter of type string is provided`, () => {
                        it(`should return the expected error`, () => {
                            assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.GREATER_THAN,
                                    field: 'foo',
                                    params: ['1'],
                                },
                                ['expected non-negative integer']
                            );
                        });
                    });
                });
            });

            describe(`MULTILINGUAL_TEXT_INCLUDES`, () => {
                describe(`when the filter is well-formed`, () => {
                    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-331] include case-sensitive option
                    describe(`when no language code is provided`, () => {
                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetThatMatchesInOriginalText,
                                // +
                                widgetThatMatchesInTranslatedText,
                                // -
                                widgetThatDoesNotMatchSearchText,
                            ]);
                        });

                        it(`should return the document`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: doesAnyTextIncludeEllo,
                            });

                            expect(result).toHaveLength(2);
                        });
                    });

                    describe(`when 2 parameters are provided`, () => {
                        describe(`when the search text is not empty`, () => {
                            beforeEach(async () => {
                                await widgetRepository.createMany([
                                    // +
                                    widgetThatMatchesInOriginalText,
                                    // -
                                    widgetThatMatchesInTranslatedText,
                                    // -
                                    widgetThatDoesNotMatchSearchText,
                                ]);
                            });

                            it(`should return the expected results`, async () => {
                                const result = await widgetRepository.fetchForUser({
                                    filter: doesEnglishTextIncludeEllo,
                                });

                                expect(result).toHaveLength(1);
                            });
                        });

                        /**
                         * A query with a language code and an empty string will
                         * return all resources that have a text item (original or translation)
                         * for the target field.
                         */
                        describe(`when the search text is empty`, () => {
                            const targetLanguageCode = LanguageCode.Chilcotin;

                            const widgetsWithTextInTargetLanguage = ['a', 'b', 'c'].map(
                                (text, index) =>
                                    dummyWidget.clone({
                                        id: buildDummyUuid(index + 1),
                                        description: buildMultilingualTextWithSingleItem(
                                            text,
                                            targetLanguageCode
                                        ),
                                    })
                            );

                            const widgetsWithNoTextInTargetLanguage = ['d', 'e', 'f', 'g'].map(
                                (text, index) =>
                                    dummyWidget.clone({
                                        id: buildDummyUuid(
                                            index + 1 + widgetsWithTextInTargetLanguage.length
                                        ),
                                        description: buildMultilingualTextWithSingleItem(
                                            text,
                                            LanguageCode.English
                                        ),
                                    })
                            );

                            const doesDescriptionHaveChilcotin: CoscradSimpleCondition = {
                                type: CoscradConditionBlockType.SIMPLE,
                                operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                                field: 'description',
                                params: ['', LanguageCode.Chilcotin],
                            };

                            beforeEach(async () => {
                                await widgetRepository.createMany([
                                    ...widgetsWithTextInTargetLanguage,
                                    ...widgetsWithNoTextInTargetLanguage,
                                ]);
                            });

                            it(`should return the expected results`, async () => {
                                const result = await widgetRepository.fetchForUser({
                                    filter: doesDescriptionHaveChilcotin,
                                });

                                expect(result).toHaveLength(widgetsWithTextInTargetLanguage.length);
                            });
                        });
                    });
                });

                describe(`when the query has an invalid structure or type`, () => {
                    describe(`when no parameters are provided`, () => {
                        it(`should return the expected error`, async () => {
                            assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                                    params: [],
                                    field: 'foo',
                                },
                                ['Expected 2 parameters, but received: 0']
                            );
                        });
                    });

                    describe(`when 3 parameters are provided`, () => {
                        const filterWithThreeParams: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                            params: ['foobarbaz', LanguageCode.English, 'why am I here?'],
                            field: 'foo',
                        };

                        it(`should return the expected error`, async () => {
                            assertQueryError(filterWithThreeParams, [
                                'Expected 2 parameters, but received: 3',
                            ]);
                        });
                    });

                    describe(`when 1 parameter is provided`, () => {
                        describe(`when the first parameter is a number instead of a string`, () => {
                            it(`should return the expected error`, async () => {
                                const invalidParam = 15;

                                assertQueryError(
                                    {
                                        type: CoscradConditionBlockType.SIMPLE,
                                        operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                                        params: [invalidParam],
                                        field: 'foo',
                                    },
                                    [
                                        'non-empty string',
                                        CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
                                        invalidParam.toString(),
                                    ]
                                );
                            });
                        });
                    });
                });
            });

            describe(`HAS_PROPERTY`, () => {
                describe(`when the query is well formed`, () => {
                    describe(`when the property is object-valued`, () => {
                        const widgetWithLocation = dummyWidget.clone({
                            id: '101',
                            location: new Location({ id: '44', name: dummyLocationName }),
                        });

                        const widgetWithoutALocation = dummyWidget.clone({
                            id: '102',
                        });

                        const anotherWidgetWithALoaction = dummyWidget.clone({
                            id: '103',
                            location: new Location({ id: '46', name: dummyLocationName }),
                        });

                        const widgetThatExplicitlyDoesNotHaveALocation = new Widget({
                            id: '104',
                            // Aaron wuz here
                            yearBuilt: 2025,
                            description: buildMultilingualTextWithSingleItem(
                                'widget with null location'
                            ),
                            location: null,
                            tags: [],
                            tokens: [],
                            comment: "this one doesn't have a location",
                        });

                        const hasLocation: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.HAS_PROPERTY,
                            field: 'location',
                            params: [],
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetWithLocation,
                                // -
                                widgetWithoutALocation,
                                // +
                                anotherWidgetWithALoaction,
                                // -
                                widgetThatExplicitlyDoesNotHaveALocation,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: hasLocation,
                            });

                            expect(result).toHaveLength(2);
                        });
                    });

                    describe(`when the property is string valued`, () => {
                        const widgetWithEmptyStringNickname = dummyWidget.clone({
                            id: '101',
                            nickname: '',
                        });

                        const widgetWithNoNickname = dummyWidget.clone({
                            id: '102',
                        });

                        const widgetWithFullNickname = dummyWidget.clone({
                            id: '103',
                            nickname: `Nicolas' Name`,
                        });

                        const hasNickname: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.HAS_PROPERTY,
                            field: 'nickname',
                            params: [],
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetWithEmptyStringNickname,
                                // -
                                widgetWithNoNickname,
                                // +
                                widgetWithFullNickname,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: hasNickname,
                            });

                            expect(result).toHaveLength(2);
                        });
                    });

                    describe(`when the property is number valued`, () => {
                        const widgetFromYearZero = dummyWidget.clone({
                            id: '101',
                            // This property is defined, although "falsey"
                            rating: 0,
                        });

                        const widgetWithHighRating = dummyWidget.clone({
                            id: '102',
                            rating: 10,
                        });

                        const widgetWithLowRating = dummyWidget.clone({
                            id: '103',
                            rating: -10,
                        });

                        const widgetWithoutARating = dummyWidget.clone({
                            id: '104',
                            // rating: 10
                        });

                        const hasRating: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.HAS_PROPERTY,
                            field: 'rating',
                            params: [],
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetFromYearZero,
                                // +
                                widgetWithHighRating,
                                // +
                                widgetWithLowRating,
                                // -
                                widgetWithoutARating,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: hasRating,
                            });

                            expect(result).toHaveLength(3);
                        });
                    });
                });

                describe(`when the query is invalid`, () => {
                    describe(`when a parameter is provided`, () => {
                        it(`should return the expected error`, async () => {
                            assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.HAS_PROPERTY,
                                    params: ['bar'],
                                    field: 'foo',
                                },
                                ['Expected 0 parameters, but received: 1']
                            );
                        });
                    });
                });
            });

            describe(`HAS_LENGTH_GREATER_THAN`, () => {
                describe(`when the query is well-formed`, () => {
                    const widgetWithTenTags = dummyWidget.clone({
                        id: '101',
                        tags: Array(10)
                            .fill(null)
                            .map((_, index) => `tag #${index}`),
                    });

                    const widgetWithNineTags = dummyWidget.clone({
                        id: '102',
                        tags: Array(9)
                            .fill(null)
                            .map((_, index) => `tag #${index}`),
                    });

                    const widgetWithNoTags = dummyWidget.clone({
                        id: '103',
                        tags: [],
                    });

                    const hasMoreThanNineTags: CoscradSimpleCondition = {
                        type: CoscradConditionBlockType.SIMPLE,
                        operator: CoscradBooleanOperator.HAS_LENGTH_GREATER_THAN,
                        field: 'tags',
                        params: [9],
                    };

                    beforeEach(async () => {
                        await widgetRepository.createMany([
                            widgetWithNineTags,
                            widgetWithTenTags,
                            widgetWithNoTags,
                        ]);
                    });

                    it(`should return the expected results`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: hasMoreThanNineTags,
                        });

                        expect(result).toHaveLength(1);
                    });
                });

                describe(`when the query is invalid`, () => {
                    describe(`when 0 parameters are provided`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.HAS_LENGTH_GREATER_THAN,
                                    field: 'foo',
                                    params: [],
                                },
                                ['expected 1 parameter, but received: 0']
                            );
                        });
                    });

                    describe(`when 2 parameters are provided`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator: CoscradBooleanOperator.HAS_LENGTH_GREATER_THAN,
                                    field: 'foo',
                                    params: [9, 11],
                                },
                                ['expected 1 parameter, but received: 2']
                            );
                        });
                    });

                    describe(`when 1 parameter is provided`, () => {
                        describe(`when the parameter is of type string`, () => {
                            it(`should return the expected error`, async () => {
                                const invalidParam = '5';

                                await assertQueryError(
                                    {
                                        type: CoscradConditionBlockType.SIMPLE,
                                        operator: CoscradBooleanOperator.HAS_LENGTH_GREATER_THAN,
                                        field: 'foo',
                                        params: [invalidParam],
                                    },
                                    ['positive integer', invalidParam]
                                );
                            });
                        });
                    });
                });
            });

            describe(`MULTILINGUAL_TEXT_INCLUDES_LETTER`, () => {
                describe(`when the query is well-formed`, () => {
                    const targetLetter = 'ts';

                    const buildToken = (...chars: string[]) => ({
                        text: chars.join(''),
                        characters: chars.map((c) => ({
                            text: c,
                            isPunctuationOrWhiteSpace: false,
                            isOutOfAlphabet: false,
                            isUpperCase: false,
                        })),
                        languageCode: LanguageCode.Chilcotin,
                        isSpace: false,
                        isPunct: false,
                        isStop: false,
                    });

                    const widgetWithLetter = dummyWidget.clone({
                        id: '101',
                        tokens: [buildToken('z'), buildToken(targetLetter, 'i', 'd')],
                    });

                    const widgetWithoutLetter = dummyWidget.clone({
                        id: '102',
                        tokens: [buildToken('r', 'o', 'b')],
                    });

                    const widgetWithLetterInWrongLanguage = dummyWidget.clone({
                        id: '103',
                        tokens: [
                            {
                                ...buildToken(targetLetter, 'a'),
                                languageCode: LanguageCode.English,
                            },
                        ],
                    });

                    const hasLetterTs: CoscradSimpleCondition = {
                        type: CoscradConditionBlockType.SIMPLE,
                        operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                        field: 'tokens',
                        params: [targetLetter, LanguageCode.Chilcotin],
                    };

                    beforeEach(async () => {
                        await widgetRepository.createMany([
                            // +
                            widgetWithLetter,
                            // -
                            widgetWithoutLetter,
                            // +
                            widgetWithLetterInWrongLanguage,
                        ]);
                    });

                    it(`should return the expected result`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: hasLetterTs,
                        });

                        expect(result).toHaveLength(1);
                    });
                });

                describe(`when the query is ill-formed`, () => {
                    describe(`when 0 parameters are provided`, () => {
                        it(`should return the expected error`, async () => {
                            await assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator:
                                        CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                    field: 'foo',
                                    params: [],
                                },
                                ['expected 2 parameters, but received: 0']
                            );
                        });
                    });

                    describe(`when 1 parameter is provided`, () => {
                        it(`should return the expected error`, async () => {
                            await assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator:
                                        CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                    field: 'foo',
                                    params: ['n'],
                                },
                                ['expected 2 parameters, but received: 1']
                            );
                        });
                    });

                    describe(`when 3 parameters are provided`, () => {
                        it(`should return the expected error`, async () => {
                            await assertQueryError(
                                {
                                    type: CoscradConditionBlockType.SIMPLE,
                                    operator:
                                        CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                    field: 'foo',
                                    params: ['n', LanguageCode.English, 'a'],
                                },
                                ['expected 2 parameters, but received: 3']
                            );
                        });
                    });

                    describe(`when 2 parameters are provided`, () => {
                        describe(`when they are passed in the wrong order ([languageCode,letterToFind])`, () => {
                            it(`should return the expected error`, async () => {
                                await assertQueryError(
                                    {
                                        type: CoscradConditionBlockType.SIMPLE,
                                        operator:
                                            CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                        // TODO test when the field is an empty string
                                        field: 'foo',
                                        params: [LanguageCode.English, 'a'],
                                    },
                                    ['expected Language Code', 'received: a']
                                );
                            });
                        });

                        describe(`when a number is provided as paramter 0 instead of text (letter)`, () => {
                            const invalidParam = 1;

                            it(`should return the expected error`, async () => {
                                await assertQueryError(
                                    {
                                        type: CoscradConditionBlockType.SIMPLE,
                                        operator:
                                            CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                        field: 'foo',
                                        params: [invalidParam, LanguageCode.English],
                                    },
                                    ['expected non-empty string', `received: ${invalidParam}`]
                                );
                            });
                        });

                        describe(`when a number is provided as parameter 1 instead of a language code`, () => {
                            it(`should return the expected error`, async () => {
                                const invalidParam = 505;

                                await assertQueryError(
                                    {
                                        type: CoscradConditionBlockType.SIMPLE,
                                        operator:
                                            CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES_LETTER,
                                        field: 'foo',
                                        params: ['a', invalidParam],
                                    },
                                    ['expected Language Code', `received: ${invalidParam}`]
                                );
                            });
                        });
                    });
                });
            });

            describe(`TEXT_INCLUDES`, () => {
                describe(`when the query is well formed`, () => {
                    describe(`when searching a non-array valued prop (comment)`, () => {
                        const textToFind = 'xyZ';

                        const widgetWhoseIdMatchesText = dummyWidget.clone({
                            id: buildDummyUuid(1),
                            comment: `A comment that matches because it has the text: ${textToFind}.`,
                        });

                        const widgetWhoseIdDoesNotMatchText = dummyWidget.clone({
                            id: buildDummyUuid(2),
                            comment: 'Aint no way I am gonna match!',
                        });

                        const simpleTextIncludes: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.TEXT_INCLUDES,
                            params: [textToFind],
                            field: 'comment',
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetWhoseIdMatchesText,
                                // -
                                widgetWhoseIdDoesNotMatchText,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: simpleTextIncludes,
                            });

                            expect(result).toHaveLength(1);
                        });
                    });

                    describe(`when searching an array valued prop (tags: string[])`, () => {
                        const searchText = 'RXz';

                        const widgetWithOneTagThatMatches = dummyWidget.clone({
                            id: buildDummyUuid(1),
                            tags: [searchText],
                        });

                        const widgetWithSomeTagsThatMatchAndSomeThatDont = dummyWidget.clone({
                            id: buildDummyUuid(2),
                            tags: [
                                searchText,
                                'no match!',
                                `Are you looking for: ${searchText}?`,
                                '123',
                            ],
                        });

                        const widgetWithNoTags = dummyWidget.clone({
                            id: buildDummyUuid(3),
                            tags: [],
                        });

                        const widgetWithTagsThatDontMatch = dummyWidget.clone({
                            id: buildDummyUuid(4),
                            tags: ['x', 'a', 'horsies'],
                        });

                        const doesAnyTagIncludeText: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator: CoscradBooleanOperator.TEXT_INCLUDES,
                            params: [searchText],
                            field: 'tags[*]',
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetWithOneTagThatMatches,
                                // +
                                widgetWithSomeTagsThatMatchAndSomeThatDont,
                                // -
                                widgetWithNoTags,
                                // -
                                widgetWithTagsThatDontMatch,
                            ]);
                        });

                        it(`should return the expected result`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: doesAnyTagIncludeText,
                            });

                            expect(result).toHaveLength(2);
                        });
                    });
                });
            });
        });

        describe(`when the query is a complex condition`, () => {
            describe(`AND`, () => {
                describe(`when the AND's conditions are all simple conditions`, () => {
                    beforeEach(async () => {
                        await widgetRepository.createMany([
                            // +
                            widgetThatMatchesInOriginalText.clone({
                                id: '1',
                                yearBuilt: cutoffYearExclusive + 1,
                            }),
                            // - (all below)
                            widgetThatMatchesInTranslatedText.clone({
                                id: '2',
                                yearBuilt: cutoffYearExclusive - 1,
                            }),
                            widgetThatDoesNotMatchSearchText.clone({
                                id: '3',
                            }),
                            widgetThatComesAfterCutoffYear.clone({
                                id: '4',
                                description: buildMultilingualTextWithSingleItem('no text match!'),
                            }),
                            widgetThatComesBeforeCutoffYear.clone({
                                id: '5',
                            }),
                        ]);
                    });

                    const doesAnyTextIncludeElloAndGreaterThanCutoffYear: CoscradAndCondition = {
                        type: CoscradConditionBlockType.AND,
                        conditions: [doesAnyTextIncludeEllo, greaterThanCutoffYear],
                    };

                    it(`should return the expected results`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: doesAnyTextIncludeElloAndGreaterThanCutoffYear,
                        });

                        expect(result).toHaveLength(1);
                    });
                });
            });

            describe(`OR`, () => {
                describe(`when the OR's conditions are all simple conditions`, () => {
                    beforeEach(async () => {
                        await widgetRepository.createMany([
                            // 3 / 5 should match the `OR`
                            // +
                            widgetThatMatchesInOriginalText.clone({
                                id: '1',
                                yearBuilt: cutoffYearExclusive + 1,
                            }),
                            // - We specify the language code to be the original ('en') language code for this case
                            widgetThatMatchesInTranslatedText.clone({
                                id: '2',
                                yearBuilt: cutoffYearExclusive - 1,
                            }),
                            // -
                            widgetThatDoesNotMatchSearchText.clone({
                                id: '3',
                                yearBuilt: cutoffYearExclusive - 1,
                            }),
                            // +
                            widgetThatComesAfterCutoffYear.clone({
                                id: '4',
                                description: buildMultilingualTextWithSingleItem('no text match!'),
                            }),
                            // +
                            widgetThatComesBeforeCutoffYear.clone({
                                id: '5',
                                description: buildMultilingualTextWithSingleItem(
                                    `H${searchText} to all!`
                                ),
                            }),
                        ]);
                    });

                    const doesEnglishTextIncludeElloOrGreaterThanCutoffYear: CoscradAndCondition = {
                        type: CoscradConditionBlockType.OR,
                        // Note we use the language-code specific version of the ml text query here
                        conditions: [doesEnglishTextIncludeEllo, greaterThanCutoffYear],
                    };

                    it(`should return the expected results`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: doesEnglishTextIncludeElloOrGreaterThanCutoffYear,
                        });

                        expect(result).toHaveLength(3);
                    });
                });
            });

            describe(`NOT`, () => {
                describe(`when the query is valid`, () => {
                    describe(`when the not's condition is a simple condition`, () => {
                        const isNotGreaterThanCutoffYear: CoscradNotCondition = {
                            type: CoscradConditionBlockType.NOT,
                            condition: greaterThanCutoffYear,
                        };

                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                widgetThatComesAfterCutoffYear,
                                widgetThatComesBeforeCutoffYear,
                            ]);
                        });

                        it(`should return the expected results`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: isNotGreaterThanCutoffYear,
                            });

                            expect(result).toHaveLength(1);
                        });
                    });
                });

                describe(`when the query is invalid`, () => {
                    describe(`when the nested condition is itself invalid`, () => {
                        const operator = CoscradBooleanOperator.GREATER_THAN;

                        const invalidCondition: CoscradSimpleCondition = {
                            type: CoscradConditionBlockType.SIMPLE,
                            operator,
                            field: 'foo',
                            params: [], // should be a single number
                        };

                        const notQuery: CoscradNotCondition = {
                            type: CoscradConditionBlockType.NOT,
                            condition: invalidCondition,
                        };

                        it(`should return the expected error`, async () => {
                            await assertQueryError(notQuery, [
                                'not block with an invalid child condition',
                                'expected 1 parameter, but received: 0',
                                operator,
                            ]);
                        });
                    });
                });
            });
        });
    });
});
