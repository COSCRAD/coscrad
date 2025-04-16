import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../app/config/buildConfigFilePath';
import { Environment } from '../../../app/config/constants/environment';
import {
    IQueryRepositoryProvider,
    QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event-handler';
import { NotFound } from '../../../lib/types/not-found';
import { PersistenceModule } from '../../persistence.module';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';

describe(`@ArangoViewRepository(...)`, () => {
    @ArangoViewRepository('machine')
    class ArangoMachineQueryRepository {
        async fetchByName(_name: string) {
            return Promise.resolve();
        }
    }

    describe(`when decorating a view repository`, () => {
        it(`should set the correct metadata`, () => {
            const foundMetadata = getArangoViewRepositoryMetadata(ArangoMachineQueryRepository);

            expect(foundMetadata).not.toBe(NotFound);

            const { viewType, ctor } = foundMetadata as ArangoViewRepositoryMetadata;

            expect(viewType).toBe('machine');

            expect(ctor).toBe(ArangoMachineQueryRepository);
        });
    });

    describe(`ArangoQueryRepositoryProvider`, () => {
        let provider: IQueryRepositoryProvider;

        beforeAll(async () => {
            const envFilePath = buildConfigFilePath(Environment.test);

            const testModuleRef = Test.createTestingModule({
                imports: [
                    ConfigModule.forRoot({
                        isGlobal: true,
                        envFilePath,
                        cache: false,
                        // validate,
                    }),
                    PersistenceModule.forRootAsync(),
                    ArangoMachineQueryRepository,
                ],
            })
                .overrideProvider(ConfigService)
                .useValue(
                    buildMockConfigService(
                        {
                            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                        },
                        envFilePath
                    )
                )
                .compile();

            const app = (await testModuleRef).createNestApplication();

            await app.init();

            provider = app.get(QUERY_REPOSITORY_PROVIDER_TOKEN);
        });

        describe(`when requesting a query repository for a valid view type`, () => {
            it(`should return an instance of the expected repository`, () => {
                const searchResult = provider.forResource('machine');

                expect(searchResult).not.toBe(NotFound);

                expect(searchResult).toBeInstanceOf(ArangoMachineQueryRepository);
            });
        });
    });
});
