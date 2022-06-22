import { CommandModule } from '@coscrad/commands';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { BibliographicReferenceQueryService } from '../../../domain/services/query-services/bibliographic-reference-query.service';
import { BookQueryService } from '../../../domain/services/query-services/book-query.service';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { PhotographQueryService } from '../../../domain/services/query-services/photograph-query.service';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { SpatialFeatureQueryService } from '../../../domain/services/query-services/spatial-feature-query.service';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { TranscribedAudioQueryService } from '../../../domain/services/query-services/transribed-audio-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
import { IdManagementService } from '../../../lib/id-generation/id-management.service';
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
import { MockIdManager } from '../command/__tests__/MockIdManager';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { IdGenerationController } from '../id-generation/id-generation.controller';
import { BibliographicReferenceController } from '../resources/bibliographic-reference.controller';
import { BookController } from '../resources/book.controller';
import { MediaItemController } from '../resources/media-item.controller';
import { PhotographController } from '../resources/photograph.controller';
import { ResourceDescriptionController } from '../resources/resource-description.controller';
import { SongController } from '../resources/song.controller';
import { SpatialFeatureController } from '../resources/spatial-feature.controller';
import { TermController } from '../resources/term.controller';
import { TranscribedAudioController } from '../resources/transcribed-audio.controller';
import { VocabularyListController } from '../resources/vocabulary-list.controller';
import { TagController } from '../tag.controller';

const mockIdManager = new MockIdManager();

export default async (
    configOverrides: Partial<DTO<EnvironmentVariables>>,
    { shouldMockIdGenerator }: { shouldMockIdGenerator: boolean } = { shouldMockIdGenerator: false }
) =>
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
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new MediaItemQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
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
            {
                provide: BookQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new BookQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: PhotographQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) =>
                    new PhotographQueryService(
                        repositoryProvider,
                        commandInfoService,
                        configService
                    ),
                inject: [RepositoryProvider, CommandInfoService, ConfigService],
            },
            {
                provide: SpatialFeatureQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new SpatialFeatureQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: BibliographicReferenceQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new BibliographicReferenceQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: 'ID_MANAGER',
                useFactory: (repositoryProvider: RepositoryProvider) =>
                    shouldMockIdGenerator
                        ? mockIdManager
                        : new IdManagementService(repositoryProvider.getIdRepository()),
                inject: [RepositoryProvider],
            },
        ],

        controllers: [
            ResourceDescriptionController,
            EdgeConnectionController,
            TagController,
            MediaItemController,
            SongController,
            TermController,
            VocabularyListController,
            TranscribedAudioController,
            BookController,
            PhotographController,
            SpatialFeatureController,
            BibliographicReferenceController,
            CategoryController,
            CommandController,
            IdGenerationController,
        ],
    }).compile();
