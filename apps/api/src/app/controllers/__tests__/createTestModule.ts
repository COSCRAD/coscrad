import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { ResourceViewModelController } from '../resourceViewModel.controller';

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

        controllers: [ResourceViewModelController, EdgeConnectionController],
    }).compile();
