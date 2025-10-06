import { LanguageCode } from '@coscrad/api-interfaces';
import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../app/config/buildConfigFilePath';
import { Environment } from '../../app/config/constants/environment';
import { buildMultilingualTextFromBilingualText } from '../../domain/common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../domain/common/entities/multilingual-text';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { ArangoDatabase } from '../../persistence/database/arango-database';
import { ArangoDatabaseForCollection } from '../../persistence/database/arango-database-for-collection';
import mapDatabaseDocumentToAggregateDTO from '../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DeepPartial } from '../../types/DeepPartial';
import { DTO } from '../../types/DTO';
import { clonePlainObjectWithOverrides } from '../utilities/clonePlainObjectWithOverrides';
import cloneToPlainObject from '../utilities/cloneToPlainObject';
import {
    CoscradAndCondition,
    CoscradBooleanOperator,
    CoscradConditionBlockType,
    CoscradFilterCondition,
    CoscradSimpleCondition,
} from './models/coscrad-filter-condition';

const WIDGETS_COLLECTION_ID = 'widgets';

class Widget {
    id: string;

    yearBuilt: number;

    description: MultilingualText;

    constructor({ id, yearBuilt, description }: DTO<Widget>) {
        this.id = id;

        this.yearBuilt = yearBuilt;

        if (isNonEmptyObject(description)) {
            this.description = new MultilingualText(description);
        }
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

const widgetThatDoesNotMachSearchText = dummyWidget.clone({
    id: '3',
    description: buildMultilingualTextWithSingleItem(`I don't match!`),
});

const doesAnyTextIncludeEllo: CoscradSimpleCondition = {
    type: CoscradConditionBlockType.SIMPLE,
    operator: CoscradBooleanOperator.MULTILINGUAL_TEXT_INCLUDES,
    field: 'description',
    params: [searchText],
};

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
        }).compile();

        const app = moduleRef.createNestApplication();

        await app.init();

        widgetRepository = new WidgetRepository(app.get(ArangoConnectionProvider));

        await app.get(ArangoConnectionProvider).createCollectionIfNotExists(WIDGETS_COLLECTION_ID);
    });

    beforeEach(async () => {
        await widgetRepository.clear();
    });

    describe(`when the query is represented as an object`, () => {
        describe(`when the query is validly formatted`, () => {
            describe(`when the query is a simple condition`, () => {
                describe(`GREATER_THAN`, () => {
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

                describe(`MULTILINGUAL_TEXT_INCLUDES`, () => {
                    // TODO include case-sensitive option
                    describe(`when no language code is provided`, () => {
                        beforeEach(async () => {
                            await widgetRepository.createMany([
                                // +
                                widgetThatMatchesInOriginalText,
                                // +
                                widgetThatMatchesInTranslatedText,
                                // -
                                widgetThatDoesNotMachSearchText,
                            ]);
                        });

                        it(`should return the document`, async () => {
                            const result = await widgetRepository.fetchForUser({
                                filter: doesAnyTextIncludeEllo,
                            });

                            expect(result).toHaveLength(2);
                        });
                    });
                });
            });

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
                            widgetThatDoesNotMachSearchText.clone({
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

                    it.only(`should return the expected results`, async () => {
                        const result = await widgetRepository.fetchForUser({
                            filter: doesAnyTextIncludeElloAndGreaterThanCutoffYear,
                        });

                        expect(result).toHaveLength(1);
                    });
                });
            });
        });
    });
});
