import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { REPOSITORY_PROVIDER } from './constants/persistenceConstants';
import { ArangoConnectionProvider } from './database/arango-connection.provider';
import { DatabaseProvider } from './database/database.provider';
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

        const repositoryProvider = {
            provide: REPOSITORY_PROVIDER,
            useFactory: async (arangoConnectionProvider: ArangoConnectionProvider) => {
                const repositoryProvider = new ArangoRepositoryProvider(
                    new DatabaseProvider(arangoConnectionProvider)
                );

                return repositoryProvider;
            },
            inject: [ArangoConnectionProvider],
        };

        return {
            module: PersistenceModule,
            imports: [ConfigModule],
            providers: [arangoConnectionProvider, repositoryProvider],
            exports: [arangoConnectionProvider, repositoryProvider],
            global: true,
        };
    }
}
