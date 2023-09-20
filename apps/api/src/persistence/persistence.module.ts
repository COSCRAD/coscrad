import { DynamicModule, Global, Module, OnApplicationShutdown } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CoscradEventFactory, EventModule } from '../domain/common';
import { ID_RESPOSITORY_TOKEN } from '../lib/id-generation/interfaces/id-repository.interface';
import { REPOSITORY_PROVIDER_TOKEN } from './constants/persistenceConstants';
import { ArangoConnectionProvider } from './database/arango-connection.provider';
import { ArangoQueryRunner } from './database/arango-query-runner';
import { ArangoDatabaseProvider } from './database/database.provider';
import { ArangoDataExporter } from './repositories/arango-data-exporter';
import { ArangoIdRepository } from './repositories/arango-id-repository';
import { ArangoRepositoryProvider } from './repositories/arango-repository.provider';
import { DomainDataExporter } from './repositories/domain-data-exporter';

@Global()
@Module({})
export class PersistenceModule implements OnApplicationShutdown {
    constructor(private readonly databaseProvider: ArangoDatabaseProvider) {}

    onApplicationShutdown(_signal?: string) {
        // Avoid memory leaks
        this.databaseProvider.close();
    }

    static forRootAsync(): DynamicModule {
        const arangoConnectionProvider = {
            provide: ArangoConnectionProvider,
            useFactory: async (configService: ConfigService) => {
                const arangoConnectionProvider = new ArangoConnectionProvider(configService);

                await arangoConnectionProvider.initialize();

                return arangoConnectionProvider;
            },
            inject: [ConfigService],
        };

        const arangoDatabaseProvider = {
            provide: ArangoDatabaseProvider,
            useFactory: async (arangoConnectionProvider: ArangoConnectionProvider) => {
                return new ArangoDatabaseProvider(arangoConnectionProvider);
            },
            inject: [ArangoConnectionProvider],
        };

        const repositoryProvider = {
            provide: REPOSITORY_PROVIDER_TOKEN,
            useFactory: async (
                arangoConnectionProvider: ArangoConnectionProvider,
                coscradEventFactory: CoscradEventFactory
            ) => {
                const repositoryProvider = new ArangoRepositoryProvider(
                    new ArangoDatabaseProvider(arangoConnectionProvider),
                    coscradEventFactory
                );

                return repositoryProvider;
            },
            inject: [ArangoConnectionProvider, CoscradEventFactory],
        };

        const idRepositoryProvider = {
            provide: ID_RESPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoIdRepository(new ArangoDatabaseProvider(arangoConnectionProvider)),
            inject: [ArangoConnectionProvider],
        };

        const arangoQueryRunnerProvider = {
            provide: ArangoQueryRunner,
            useFactory: (arangoDatabaseProvider: ArangoDatabaseProvider) =>
                new ArangoQueryRunner(arangoDatabaseProvider),
            inject: [ArangoDatabaseProvider],
        };

        const arangoDataExporterProvider = {
            provide: ArangoDataExporter,
            useFactory: (arangoQueryRunner: ArangoQueryRunner) =>
                new ArangoDataExporter(arangoQueryRunner),
            inject: [ArangoQueryRunner],
        };

        const domainDataExporterProvider = {
            provide: DomainDataExporter,
            useFactory: (arangoRepositoryProvider: ArangoRepositoryProvider) =>
                new DomainDataExporter(arangoRepositoryProvider),
            inject: [REPOSITORY_PROVIDER_TOKEN],
        };

        return {
            module: PersistenceModule,
            imports: [ConfigModule, EventModule],
            providers: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
                arangoQueryRunnerProvider,
                arangoDataExporterProvider,
                domainDataExporterProvider,
            ],
            exports: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
                arangoQueryRunnerProvider,
                arangoDataExporterProvider,
                domainDataExporterProvider,
            ],
            global: true,
        };
    }
}
