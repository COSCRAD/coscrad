import { LanguageCode, PaginatedResponse, ResourceType } from '@coscrad/api-interfaces';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/environment';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { InternalError } from '../../errors/InternalError';
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

const tokenizer = new ChilcotinTokenizer();

const tokens = tokenizer.tokenize(termWithLetter);

const secondTermWithLetter = 'natled';

// Can we remove the use of the enum here?
// Can we avoid using a "real" resource type?
// Shouldn't this work with documents of **any** type?
const targetResourceType = ResourceType.term;

const targetCompositeIdentifier = {
    type: ResourceType.term,
    id: buildDummyUuid(33),
};

describe(`ArangoFullTextSearchQueryRepository`, () => {
    let testRepository: IFullTextSearchQueryRepository;

    let arangoDatabaseProvider: ArangoDatabaseProvider;

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

        arangoDatabaseProvider = app.get(ArangoDatabaseProvider);
    });

    describe(`ArangoFullTextSearchQueryRepository`, () => {
        beforeEach(async () => {
            await arangoDatabaseProvider.clearViews();
        });

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
                        const secondTargetCompositeIdentifier = {
                            type: ResourceType.term,
                            id: buildDummyUuid(34),
                        };

                        beforeEach(async () => {
                            await testRepository.index(
                                tokenizer.tokenize(secondTermWithLetter),
                                secondTargetCompositeIdentifier
                            );
                        });

                        it(`should return the matches`, async () => {
                            const result = (await testRepository.findByLetter(
                                targetLetter,
                                LanguageCode.Chilcotin
                            )) as PaginatedResponse<FullTextSearchRecord>;

                            expect(result.count).toBe(2);
                        });
                    });

                    describe(`when there are matches for multiple resource types`, () => {
                        const secondResourceType = 'widget';

                        const compositeIdentifierForResourceOfSecondType = {
                            type: secondResourceType,
                            id: buildDummyUuid(44),
                        };

                        const textForResourceOfSecondType = `${targetLetter}agh`;

                        beforeEach(async () => {
                            await testRepository.index(
                                tokenizer.tokenize(textForResourceOfSecondType),
                                compositeIdentifierForResourceOfSecondType
                            );
                        });

                        it(`should return the matches`, async () => {
                            const result = (await testRepository.findByLetter(
                                targetLetter,
                                LanguageCode.Chilcotin
                            )) as PaginatedResponse<FullTextSearchRecord>;

                            const resultsOfFirstResourceType = result.entities.filter(
                                (record) => record.compositeIdentifier.type == targetResourceType
                            );

                            expect(resultsOfFirstResourceType).toHaveLength(1);

                            const resultsOfSecondResourceType = result.entities.filter(
                                (record) => record.compositeIdentifier.type == secondResourceType
                            );

                            expect(resultsOfSecondResourceType).toHaveLength(1);
                        });
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

                /**
                 * Parsing English letters is very simple to implement. We just
                 * split on '' and check if the letter is in the alphabet. If
                 * we want full tokenization, this is a solved problem as well.
                 * We should implement this soon.
                 */
                describe(`when the langauge is English`, () => {
                    it(`should return an unsupported language error`, async () => {
                        const result = await testRepository.findByLetter(
                            targetLetter,
                            LanguageCode.English
                        );

                        const message = (result as InternalError).toString().toLowerCase();

                        expect(message).toContain('nsupported language');

                        expect(message).toContain(LanguageCode.English);
                    });
                });

                // TODO We need a tokenizer for Haida in order to support full-text search
                describe(`when the langauge is Haida`, () => {
                    it(`should return an unsupported language error`, async () => {
                        const result = await testRepository.findByLetter(
                            targetLetter,
                            LanguageCode.Haida
                        );

                        const message = (result as InternalError).toString().toLowerCase();

                        expect(message).toContain('nsupported language');

                        expect(message).toContain(LanguageCode.Haida);
                    });
                });
            });

            describe(`when the language is not specified`, () => {
                describe('currently this is not supported', () => {
                    it(`should return the expected error`, async () => {
                        const result = await testRepository.findByLetter(
                            targetLetter
                            /**
                             * TODO What other filters might we want to support?
                             * For example, we may only want to find resources
                             * of a given type or list of types. Do we support
                             * this via dynamic filters or hard-wire them
                             * as part of the API?
                             */
                        );

                        const message = (result as InternalError).toString();

                        expect(message).toContain(
                            'you must specify the language when performing a full-text search'
                        );
                    });
                });

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
