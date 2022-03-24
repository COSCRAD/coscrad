import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ArangoConnectionProvider } from './database/arango-connection.provider';
import { DatabaseProvider } from './database/database.provider';
import { RepositoryProvider } from './repositories/repository.provider';

@Global()
@Module({})
export class PersistenceModule {
    static forRootAsync(): DynamicModule {
        const arangoConnectionProvider = {
            provide: 'ArangoConnectionProvider',
            useFactory: async (configService: ConfigService) => {
                const arangoConnectionProvider = new ArangoConnectionProvider(configService);

                await arangoConnectionProvider.initialize();

                return arangoConnectionProvider;
            },
            inject: [ConfigService],
        };

        const repositoryProvider = {
            provide: `RepositoryProvider`,
            useFactory: async (arangoConnectionProvider: ArangoConnectionProvider) => {
                const repositoryProvider = new RepositoryProvider(
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
