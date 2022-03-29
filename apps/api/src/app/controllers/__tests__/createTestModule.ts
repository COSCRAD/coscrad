import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ArangoConnectionProvider } from 'apps/api/src/persistence/database/arango-connection.provider';
import { RepositoryProvider } from 'apps/api/src/persistence/repositories/repository.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import { EntityViewModelController } from '../entityViewModel.controller';

export default async (testDatabaseName: string) =>
    Test.createTestingModule({
        providers: [
            {
                provide: ConfigService,
                useFactory: () =>
                    buildMockConfigServiceSpec(
                        {
                            ARANGO_DB_NAME: testDatabaseName,
                        },
                        buildConfigFilePath(Environment.test)
                    ),
            },
            {
                provide: ArangoConnectionProvider,
                useFactory: async (configService: ConfigService) => {
                    const provider = new ArangoConnectionProvider(configService);

                    await provider.initialize();

                    return provider;
                },
                inject: [ConfigService],
            },
            {
                provide: RepositoryProvider,
                useFactory: (arangoConnectionProvider: ArangoConnectionProvider) => {
                    return new RepositoryProvider(new DatabaseProvider(arangoConnectionProvider));
                },
                inject: [ArangoConnectionProvider],
            },
        ],

        controllers: [EntityViewModelController],
    }).compile();
