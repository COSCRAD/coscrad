import { IDetailQueryResult, ITermViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/Environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ITermQueryRepository } from '../queries/term-query-repository.interface';
import { ArangoTermQueryRepository } from './arango-term-query-repository';

describe(`ArangoTermQueryRepository`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                        // TODO this shouldn't be necessary
                        ARANGO_DB_HOST_PORT: 8551,
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        arangoDatabaseForCollection = databaseProvider.getDatabaseForCollection('term__VIEWS');

        testQueryRepository = new ArangoTermQueryRepository(connectionProvider);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    const termIds = [1, 2, 3].map(buildDummyUuid);

    const buildTermText = (id: string) => `term ${id}`;

    const termText = buildTermText(termIds[0]);

    const originalLanguageCode = LanguageCode.Chilcotin;

    const termViews = termIds.map((id) => ({
        id,
        contributions: [],
        name: buildMultilingualTextWithSingleItem(buildTermText(id), originalLanguageCode),
        actions: [],
    }));

    describe(`fetchById`, () => {
        const targetTermId = termIds[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(termViews[0]);
        });

        describe(`when there is a term with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetTermId);

                expect(result).not.toBe(NotFound);

                const { name } = result as IDetailQueryResult<ITermViewModel>;

                const foundOriginalTextForTerm = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForTerm).toBe(termText);
            });
        });

        describe(`when there is no term with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_123');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            for (const term of termViews) {
                await testQueryRepository.create(term);
            }
        });

        it(`should return the expected term views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(termViews.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are term views in the database`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                for (const term of termViews) {
                    await testQueryRepository.create(term);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(termViews.length);
            });
        });

        describe(`when the database collection is empty`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                // no terms are added here
            });

            it(`should return 0`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`translate`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetTerm);
        });

        it(`should append the expected multilingual text item`, async () => {
            const targetTranslationRole = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translate(targetTerm.id, {
                text: textTranslation,
                languageCode: translationLangaugeCode,
                role: targetTranslationRole,
            });

            const updatedTerm = await testQueryRepository.fetchById(targetTerm.id);

            if (isNotFound(updatedTerm)) {
                expect(updatedTerm).not.toBe(NotFound);

                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedTerm.name); // we want an instance (not a DTO) for the query methods

            const searchResultForTranslation = updatedName.getTranslation(translationLangaugeCode);

            expect(searchResultForTranslation).not.toBe(NotFound);

            const foundTranslation = searchResultForTranslation as MultilingualTextItem;

            expect(foundTranslation.text).toBe(textTranslation);

            expect(foundTranslation.role).toBe(targetTranslationRole);
        });
    });

    describe(`addAudio`, () => {
        const targetTerm = termViews[0];

        const audioUrl = 'https://www.coscrad.org/test123.mp3';

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetTerm);
        });

        it(`should append the audio item`, async () => {
            await testQueryRepository.addAudio(targetTerm.id, originalLanguageCode, audioUrl);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            // TODO In the future, we should use multilingual audio for terms
            expect(updatedView.audioURL).toBe(audioUrl);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(termViews);
        });

        it(`should remove the given term`, async () => {
            const targetTermViewId = termIds[0];

            const expectedNumberOfTermsAfterDelete = termViews.length - 1;

            await testQueryRepository.delete(targetTermViewId);

            const actualNumberOfTerms = await testQueryRepository.count();

            expect(actualNumberOfTerms).toBe(expectedNumberOfTermsAfterDelete);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(termViews);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(termViews.length);
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the correct term view`, async () => {
            const termToCreate = termViews[0];

            // act
            await testQueryRepository.create(termToCreate);

            const searchResult = await testQueryRepository.fetchById(termToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            const foundTermView = searchResult as TermViewModel;

            const name = new MultilingualText(foundTermView.name);

            expect(name.getOriginalTextItem().text).toBe(termText);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the expected term views`, async () => {
            // act
            await testQueryRepository.createMany(termViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(termViews.length);
        });
    });
});
