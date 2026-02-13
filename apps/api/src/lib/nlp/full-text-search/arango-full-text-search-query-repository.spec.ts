import { LanguageCode, PaginatedResponse, ResourceType } from '@coscrad/api-interfaces';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { CoscradNLPModule } from '../coscrad-natural-language-processing.module';
import { ChilcotinTokenizer } from '../tokenization';
import { FullTextSearchRecord } from './full-text-result-record.dto';
import {
    FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN,
    IFullTextSearchQueryRepository,
} from './full-text-search-query.interface';

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
        }).compile();

        const app = testModule.createNestApplication();

        await app.init();

        testRepository = app.get(FULL_TEXT_SEARCH_QUERY_REPOSITORY_INJECTION_TOKEN);
    });

    describe(`ArangoFullTextSearchQueryRepository`, () => {
        describe(`findByLetter`, () => {
            describe(`when specifying the language`, () => {
                describe(`when the language is Chilcotin`, () => {
                    const targetLetter = 'tl';

                    // TODO insert proper characters here!
                    const termWithLetter = `Lha teyatl;g gut'in`;

                    const tokens = new ChilcotinTokenizer().tokenize(termWithLetter);

                    const targetCompositeIdentifier = {
                        type: ResourceType.term,
                        id: buildDummyUuid(33),
                    };

                    describe(`when is one result that has the target letter`, () => {
                        beforeEach(async () => {
                            await testRepository.index(tokens, targetCompositeIdentifier);
                        });

                        it(`should return the expected result`, async () => {
                            const result = (await testRepository.findByLetter(
                                targetLetter,
                                LanguageCode.Chilcotin
                            )) as PaginatedResponse<FullTextSearchRecord>;

                            expect(result.count).toBe(1);
                        });
                    });
                });
            });
        });
    });
});
