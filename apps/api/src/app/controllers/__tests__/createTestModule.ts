import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { DTO } from '../../../types/DTO';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { EnvironmentVariables } from '../../config/env.validation';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import { CategoryController } from '../category.controller';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { ResourceViewModelController } from '../resourceViewModel.controller';
import { TagController } from '../tag.controller';

export default async (configOverrides: Partial<DTO<EnvironmentVariables>>) =>
    Test.createTestingModule({
        providers: [
            {
                provide: ConfigService,
                useFactory: () =>
                    buildMockConfigServiceSpec(
                        configOverrides,
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

        controllers: [
            ResourceViewModelController,
            EdgeConnectionController,
            TagController,
            CategoryController,
        ],
    }).compile();
