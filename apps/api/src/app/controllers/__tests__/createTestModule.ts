import { CommandModule } from '@coscrad/commands';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { TranscribedAudioQueryService } from '../../../domain/services/query-services/transribed-audio-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
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
import { CommandInfoService } from '../command/services/command-info-service';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { MediaItemController } from '../resources/media-item.controller';
import { SongController } from '../resources/song.controller';
import { TermController } from '../resources/term.controller';
import { TranscribedAudioController } from '../resources/transcribed-audio.controller';
import { VocabularyListController } from '../resources/vocabulary-list.controller';
import { ResourceViewModelController } from '../resourceViewModel.controller';
import { TagController } from '../tag.controller';

export default async (configOverrides: Partial<DTO<EnvironmentVariables>>) =>
    Test.createTestingModule({
        imports: [CommandModule],
        providers: [
            CommandInfoService,
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
            {
                provide: SongQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new SongQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: TermQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) => new TermQueryService(repositoryProvider, commandInfoService, configService),
                inject: [RepositoryProvider, CommandInfoService, ConfigService],
            },
            {
                provide: VocabularyListQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) =>
                    new VocabularyListQueryService(
                        repositoryProvider,
                        commandInfoService,
                        configService
                    ),
                inject: [RepositoryProvider, CommandInfoService, ConfigService],
            },
            {
                provide: TranscribedAudioQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) =>
                    new TranscribedAudioQueryService(
                        repositoryProvider,
                        commandInfoService,
                        configService
                    ),
                inject: [RepositoryProvider, CommandInfoService, ConfigService],
            },
        ],

        controllers: [
            ResourceViewModelController,
            EdgeConnectionController,
            TagController,
            MediaItemController,
            SongController,
            TermController,
            VocabularyListController,
            TranscribedAudioController,
            CategoryController,
            CommandController,
        ],
    }).compile();
