import { CommandModule } from '@coscrad/commands';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MediaItemQueryService } from '../../../domain/services/media-item-query.service';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { DTO } from '../../../types/DTO';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { EnvironmentVariables } from '../../config/env.validation';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import { CategoryController } from '../category.controller';
import { CommandController } from '../command/command.controller';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { MediaItemController } from '../resources/media-item.controller';
import { ResourceViewModelController } from '../resourceViewModel.controller';
import { TagController } from '../tag.controller';

export default async (configOverrides: Partial<DTO<EnvironmentVariables>>) =>
    Test.createTestingModule({
        imports: [CommandModule],
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
            {
                provide: MediaItemQueryService,
                useFactory: (repositoryProvider: RepositoryProvider) =>
                    new MediaItemQueryService(repositoryProvider),
                inject: [RepositoryProvider],
            },
            // {
            //     provide: AddSongHandler,
            //     useFactory: (repositoryProvider: RepositoryProvider) =>
            //         new AddSongHandler(repositoryProvider, ),
            //     inject: [RepositoryProvider],
            // },
            // {
            //     provide: AddSong,
            //     useClass: AddSong,
            // },
        ],

        controllers: [
            ResourceViewModelController,
            EdgeConnectionController,
            TagController,
            MediaItemController,
            CategoryController,
            CommandController,
        ],
    }).compile();
