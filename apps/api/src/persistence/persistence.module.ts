import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ID_RESPOSITORY_TOKEN } from '../lib/id-generation/interfaces/id-repository.interface';
import { REPOSITORY_PROVIDER_TOKEN } from './constants/persistenceConstants';
import { ArangoConnectionProvider } from './database/arango-connection.provider';
import { ArangoDatabaseProvider } from './database/database.provider';
import { ArangoIdRepository } from './repositories/arango-id-repository';
import { ArangoRepositoryProvider } from './repositories/arango-repository.provider';

@Global()
@Module({})
export class PersistenceModule {
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
            useFactory: async (arangoConnectionProvider: ArangoConnectionProvider) => {
                const repositoryProvider = new ArangoRepositoryProvider(
                    new ArangoDatabaseProvider(arangoConnectionProvider)
                );

                return repositoryProvider;
            },
            inject: [ArangoConnectionProvider],
        };

        const idRepositoryProvider = {
            provide: ID_RESPOSITORY_TOKEN,
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoIdRepository(new ArangoDatabaseProvider(arangoConnectionProvider)),
            inject: [ArangoConnectionProvider],
        };

        return {
            module: PersistenceModule,
            imports: [ConfigModule],
            providers: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
            ],
            exports: [
                arangoConnectionProvider,
                repositoryProvider,
                idRepositoryProvider,
                arangoDatabaseProvider,
            ],
            global: true,
        };
    }
}
