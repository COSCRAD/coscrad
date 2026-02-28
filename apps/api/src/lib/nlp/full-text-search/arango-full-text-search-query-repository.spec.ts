import { LanguageCode, PaginatedResponse, ResourceType } from '@coscrad/api-interfaces';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/environment';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradNLPModule } from '../coscrad-natural-language-processing.module';
import { ChilcotinTokenizer } from '../tokenization';
import { FullTextSearchRecord } from './full-text-result-record.dto';
import {
    FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN,
    IFullTextSearchQueryRepository,
} from './full-text-search-query.interface';

const chilcotinTokenizer = new ChilcotinTokenizer();

const targetLetter = 'tl';

const termWithLetter = `Lha teyatlɨg gut’in`;

const tokens = new ChilcotinTokenizer().tokenize(termWithLetter);

const targetCompositeIdentifier = {
    type: ResourceType.term,
    id: buildDummyUuid(33),
};

describe(`ArangoFullTextSearchQueryRepository`, () => {
    let testRepository: IFullTextSearchQueryRepository;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                CoscradNLPModule,
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        const app = testModule.createNestApplication();

        await app.init();

        testRepository = app.get(FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN);

        await app.get(ArangoDatabaseProvider).clearViews();
    });

    describe(`ArangoFullTextSearchQueryRepository`, () => {
        describe(`findByLetter`, () => {
            beforeEach(async () => {
                await testRepository.index(tokens, targetCompositeIdentifier);

                await testRepository.index(chilcotinTokenizer.tokenize('Nidinyash'), {
                    type: ResourceType.term,
                    id: buildDummyUuid(404),
                });
                await testRepository.index(chilcotinTokenizer.tokenize('ʔel'), {
                    type: ResourceType.song,
                    id: buildDummyUuid(505),
                });
            });

            describe(`when specifying the language`, () => {
                describe(`when the language is Chilcotin`, () => {
                    describe(`when there are multiple matches for one resource type`, () => {
                        it.todo(`should return the matches`);
                    });

                    describe(`when there are matches for multiple resource types`, () => {
                        it.todo(`should return the matches`);
                    });

                    describe(`when there is one result that has the target letter`, () => {
                        it(`should return the expected result`, async () => {
                            const result = (await testRepository.findByLetter(
                                targetLetter,
                                LanguageCode.Chilcotin
                            )) as PaginatedResponse<FullTextSearchRecord>;

                            expect(result.count).toBe(1);
                        });
                    });

                    describe(`when there are no results that have the target letter`, () => {
                        beforeEach(async () => {
                            await testRepository.index(tokens, targetCompositeIdentifier);
                        });

                        it(`should return no results`, async () => {
                            const targetLetterWithNoMatches = 'ch’';

                            const result = (await testRepository.findByLetter(
                                targetLetterWithNoMatches,
                                LanguageCode.Chilcotin
                            )) as PaginatedResponse<FullTextSearchRecord>;

                            expect(result.count).toBe(0);
                        });
                    });
                });
            });

            describe(`when the language is not specified`, () => {
                describe(`when the search terms match entries across multiple resource types`, () => {
                    it.todo(`should find the expected results`);
                });

                describe(`when the search terms match entries for one resource type`, () => {
                    describe(`when there is one match`, () => {
                        it.todo(`should find the expected result`);
                    });

                    describe(`when there are multiple matches`, () => {
                        it.todo(`should find the expected matches`);
                    });
                });

                describe(`when there is no match`, () => {
                    it.todo(`should return no matches`);
                });
            });
        });
    });
});
