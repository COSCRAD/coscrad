import { CommandModule } from '@coscrad/commands';
import { bootstrapDynamicTypes } from '@coscrad/data-types';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../../authorization/jwt.strategy';
import { MockJwtAdminAuthGuard } from '../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../authorization/mock-jwt-auth-guard';
import { MockJwtStrategy } from '../../../authorization/mock-jwt.strategy';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { CoscradEventFactory, CoscradEventUnion } from '../../../domain/common';
import { ID_MANAGER_TOKEN } from '../../../domain/interfaces/id-manager.interface';
import {
    AddLineItemToTranscript,
    AddLineItemtoTranscriptCommandHandler,
    CreateAudioItem,
    CreateAudioItemCommandHandler,
    CreateTranscript,
    CreateTranscriptCommandHandler,
    TranslateLineItem,
    TranslateLineItemCommandHandler,
} from '../../../domain/models/audio-item/commands';
import {
    AddParticipantToTranscript,
    AddParticipantToTranscriptCommandHandler,
} from '../../../domain/models/audio-item/commands/transcripts/add-participant-to-transcript';
import {
    ImportLineItemsToTranscript,
    ImportLineItemsToTranscriptCommandHandler,
} from '../../../domain/models/audio-item/commands/transcripts/import-line-items-to-transcript';
import { CreateBookBibliographicReference } from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command';
import { CreateBookBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command-handler';
import BookBibliographicReferenceData from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference-data.entity';
import { CreateCourtCaseBibliographicReference } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command';
import { CreateCourtCaseBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command-handler';
import { CourtCaseBibliographicReferenceData } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference-data.entity';
import { CreateJournalArticleBibliographicReference } from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command';
import { CreateJournalArticleBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command-handler';
import JournalArticleBibliographicReferenceData from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference-data.entity';
import { BibliographicReferenceDataUnion } from '../../../domain/models/bibliographic-reference/shared';
import {
    CreateNoteAboutResource,
    CreateNoteAboutResourceCommandHandler,
} from '../../../domain/models/context/commands';
import {
    ConnectResourcesWithNote,
    ConnectResourcesWithNoteCommandHandler,
} from '../../../domain/models/context/commands/connect-resources-with-note';
import { EdgeConnectionContextUnion } from '../../../domain/models/context/edge-connection-context-union';
import {
    EdgeConnection,
    EdgeConnectionMember,
} from '../../../domain/models/context/edge-connection.entity';
import {
    EMPTY_DTO_INJECTION_TOKEN,
    FreeMultilineContext,
} from '../../../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { IdentityContext } from '../../../domain/models/context/identity-context.entity/identity-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { PointContext } from '../../../domain/models/context/point-context/point-context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { CreateMediaItemCommandHandler } from '../../../domain/models/media-item/commands/create-media-item.command-handler';
import {
    AddAudioItemToPlaylistCommandHandler,
    CreatePlayListCommandHandler,
    ImportAudioItemsToPlaylist,
    ImportAudioItemsToPlaylistCommandHandler,
    TranslatePlaylistNameCommandHandler,
} from '../../../domain/models/playlist/commands';
import {
    PublishResource,
    PublishResourceCommandHandler,
} from '../../../domain/models/shared/common-commands';
import { GrantResourceReadAccessToUser } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
import { GrantResourceReadAccessToUserCommandHandler } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command-handler';
import { ResourcePublished } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import {
    AddLyricsForSong,
    AddLyricsForSongCommandHandler,
    LyricsAddedForSong,
    SongCreated,
    SongLyricsTranslated,
    SongTitleTranslated,
    TranslateSongLyrics,
    TranslateSongLyricsCommandHandler,
    TranslateSongTitle,
    TranslateSongTitleCommandHandler,
} from '../../../domain/models/song/commands';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../../domain/models/song/commands/create-song.command-handler';
import {
    CreatePoint,
    CreatePointCommandHandler,
} from '../../../domain/models/spatial-feature/point/commands';
import {
    CreateTag,
    CreateTagCommandHandler,
    RelabelTag,
    RelabelTagCommandHandler,
    TagResourceOrNote,
    TagResourceOrNoteCommandHandler,
} from '../../../domain/models/tag/commands';
import {
    CreateTerm,
    CreateTermCommandHandler,
    TranslateTerm,
    TranslateTermCommandHandler,
} from '../../../domain/models/term/commands';
import {
    CreateGroup,
    CreateGroupCommandHandler,
} from '../../../domain/models/user-management/group/commands';
import { AddUserToGroup } from '../../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command';
import { AddUserToGroupCommandHandler } from '../../../domain/models/user-management/group/commands/add-user-to-group/add-user-to-group.command-handler';
import { GrantUserRole } from '../../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command';
import { GrantUserRoleCommandHandler } from '../../../domain/models/user-management/user/commands/grant-user-role/grant-user-role.command-handler';
import { RegisterUser } from '../../../domain/models/user-management/user/commands/register-user/register-user.command';
import { RegisterUserCommandHandler } from '../../../domain/models/user-management/user/commands/register-user/register-user.command-handler';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import {
    CreateVideo,
    CreateVideoCommandHandler,
    TranslateVideoName,
    TranslateVideoNameCommandHandler,
} from '../../../domain/models/video';
import {
    CreateVocabularyList,
    CreateVocabularyListCommandHandler,
} from '../../../domain/models/vocabulary-list/commands/create-vocabulary-list';
import {
    TranslateVocabularyListName,
    TranslateVocabularyListNameCommandHandler,
} from '../../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name';
import { AudioItemQueryService } from '../../../domain/services/query-services/audio-item-query.service';
import { BibliographicReferenceQueryService } from '../../../domain/services/query-services/bibliographic-reference-query.service';
import { BookQueryService } from '../../../domain/services/query-services/book-query.service';
import { CoscradUserGroupQueryService } from '../../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../../domain/services/query-services/coscrad-user-query.service';
import { EdgeConnectionQueryService } from '../../../domain/services/query-services/edge-connection-query.service';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { PhotographQueryService } from '../../../domain/services/query-services/photograph-query.service';
import { PlaylistQueryService } from '../../../domain/services/query-services/playlist-query.service';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { SpatialFeatureQueryService } from '../../../domain/services/query-services/spatial-feature-query.service';
import { TagQueryService } from '../../../domain/services/query-services/tag-query.service';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { VideoQueryService } from '../../../domain/services/query-services/video-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
import { InternalError } from '../../../lib/errors/InternalError';
import { IdManagementService } from '../../../lib/id-generation/id-management.service';
import { MockIdManagementService } from '../../../lib/id-generation/mock-id-management.service';
import { Ctor } from '../../../lib/types/Ctor';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import { ArangoEventRepository } from '../../../persistence/repositories/arango-event-repository';
import { ArangoIdRepository } from '../../../persistence/repositories/arango-id-repository';
import { ArangoRepositoryProvider } from '../../../persistence/repositories/arango-repository.provider';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
import { BibliographicReferenceViewModel } from '../../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { NoteViewModel } from '../../../view-models/edgeConnectionViewModels/note.view-model';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { EnvironmentVariables } from '../../config/env.validation';
import { AdminController } from '../admin.controller';
import { CategoryController } from '../category.controller';
import { AdminJwtGuard, CommandController } from '../command/command.controller';
import { CommandInfoService } from '../command/services/command-info-service';
import { CoscradUserGroupController } from '../coscrad-user-group.controller';
import { CoscradUserController } from '../coscrad-user.controller';
import { EdgeConnectionController } from '../edgeConnection.controller';
import { IdGenerationController } from '../id-generation/id-generation.controller';
import { AudioItemController } from '../resources/audio-item.controller';
import { BibliographicReferenceController } from '../resources/bibliographic-reference.controller';
import { BookController } from '../resources/book.controller';
import { MediaItemController } from '../resources/media-item.controller';
import { PhotographController } from '../resources/photograph.controller';
import { PlaylistController } from '../resources/playlist.controller';
import { ResourceDescriptionController } from '../resources/resource-description.controller';
import { SongController } from '../resources/song.controller';
import { SpatialFeatureController } from '../resources/spatial-feature.controller';
import { TermController } from '../resources/term.controller';
import { VideoController } from '../resources/video.controller';
import { VocabularyListController } from '../resources/vocabulary-list.controller';
import { TagController } from '../tag.controller';

type CreateTestModuleOptions = {
    shouldMockIdGenerator: boolean;
    testUserWithGroups?: CoscradUserWithGroups;
};

// If not specified, there will be no test user attached to requests
const optionDefaults = { shouldMockIdGenerator: false };

export const buildAllDataClassProviders = () =>
    [
        // Classes with dynamic union data types
        // Bibliographic References
        BibliographicReferenceDataUnion,
        BibliographicReferenceViewModel,
        CourtCaseBibliographicReferenceData,
        JournalArticleBibliographicReferenceData,
        BookBibliographicReferenceData,
        // Edge Connections
        EdgeConnection,
        EdgeConnectionMember,
        NoteViewModel,
        ConnectResourcesWithNote,
        CreateNoteAboutResource,
        // Context Union
        EdgeConnectionContextUnion,
        GeneralContext,
        PageRangeContext,
        TimeRangeContext,
        TextFieldContext,
        PointContext,
        FreeMultilineContext,
        IdentityContext,
        // Events
        CoscradEventUnion,
        SongCreated,
        SongTitleTranslated,
        LyricsAddedForSong,
        SongLyricsTranslated,
        ResourcePublished,
    ].map((ctor: Ctor<unknown>) => ({
        provide: ctor,
        useValue: ctor,
    }));

const dataClassProviders = buildAllDataClassProviders();

export default async (
    configOverrides: Partial<DTO<EnvironmentVariables>>,
    userOptions: Partial<CreateTestModuleOptions> = optionDefaults
) => {
    const { shouldMockIdGenerator, testUserWithGroups } = {
        ...optionDefaults,
        ...userOptions,
    };

    // shouldn't we just call this on the data finder service when we initialize the test module?
    bootstrapDynamicTypes(dataClassProviders);

    const testModule = await Test.createTestingModule({
        imports: [
            CommandModule,
            PassportModule.register({ defaultStrategy: 'jwt' }),
            DynamicDataTypeModule,
        ],
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
                provide: CoscradEventFactory,
                useFactory: (dynamicDataTypeFinderService: DynamicDataTypeFinderService) =>
                    new CoscradEventFactory(dynamicDataTypeFinderService),
                inject: [DynamicDataTypeFinderService],
            },
            {
                provide: ArangoEventRepository,
                useFactory: (
                    arangoConnectionProvider: ArangoConnectionProvider,
                    coscradEventFactory: CoscradEventFactory
                ) =>
                    new ArangoEventRepository(
                        new ArangoDatabaseProvider(arangoConnectionProvider),
                        coscradEventFactory
                    ),
                inject: [ArangoConnectionProvider, CoscradEventFactory],
            },
            {
                provide: REPOSITORY_PROVIDER_TOKEN,
                useFactory: (
                    arangoConnectionProvider: ArangoConnectionProvider,
                    coscradEventFactory: CoscradEventFactory
                ) => {
                    return new ArangoRepositoryProvider(
                        new ArangoDatabaseProvider(arangoConnectionProvider),
                        coscradEventFactory
                    );
                },
                inject: [ArangoConnectionProvider, CoscradEventFactory],
            },
            {
                provide: EdgeConnectionQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) =>
                    new EdgeConnectionQueryService(
                        repositoryProvider,
                        commandInfoService,
                        configService
                    ),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService, ConfigService],
            },
            {
                provide: TagQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new TagQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: MediaItemQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new MediaItemQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: SongQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new SongQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: TermQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new TermQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService, ConfigService],
            },
            {
                provide: VocabularyListQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new VocabularyListQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService, ConfigService],
            },
            {
                provide: AudioItemQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new AudioItemQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: VideoQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new VideoQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService, ConfigService],
            },
            {
                provide: BookQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new BookQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: PhotographQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new PhotographQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService, ConfigService],
            },
            {
                provide: SpatialFeatureQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new SpatialFeatureQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: BibliographicReferenceQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new BibliographicReferenceQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: PlaylistQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new PlaylistQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: CoscradUserGroupQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new CoscradUserGroupQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: CoscradUserQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new CoscradUserQueryService(repositoryProvider, commandInfoService),
                inject: [REPOSITORY_PROVIDER_TOKEN, CommandInfoService],
            },
            {
                provide: ID_MANAGER_TOKEN,
                useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                    shouldMockIdGenerator
                        ? new MockIdManagementService(
                              new ArangoIdRepository(
                                  new ArangoDatabaseProvider(arangoConnectionProvider)
                              )
                          )
                        : new IdManagementService(
                              new ArangoIdRepository(
                                  new ArangoDatabaseProvider(arangoConnectionProvider)
                              )
                          ),
                inject: [ArangoConnectionProvider],
            },
            {
                provide: JwtStrategy,
                useFactory: () => new MockJwtStrategy(testUserWithGroups),
            },
            ...dataClassProviders,
            /**
             * TODO [https://www.pivotaltracker.com/story/show/182576828]
             *
             * Avoid reduplicate domain module providers here! We should use the real
             * app module to dynamically discover all commands.
             */
            CreateMediaItem,
            CreateMediaItemCommandHandler,
            CreateSong,
            CreateSongCommandHandler,
            AddLyricsForSong,
            AddLyricsForSongCommandHandler,
            CreateBookBibliographicReference,
            CreateBookBibliographicReferenceCommandHandler,
            CreateCourtCaseBibliographicReference,
            CreateCourtCaseBibliographicReferenceCommandHandler,
            CreateJournalArticleBibliographicReference,
            CreateJournalArticleBibliographicReferenceCommandHandler,
            RegisterUser,
            RegisterUserCommandHandler,
            CreateGroup,
            CreateGroupCommandHandler,
            AddUserToGroup,
            AddUserToGroupCommandHandler,
            GrantUserRole,
            GrantUserRoleCommandHandler,
            GrantResourceReadAccessToUser,
            GrantResourceReadAccessToUserCommandHandler,
            PublishResource,
            PublishResourceCommandHandler,
            CreateTag,
            CreateTagCommandHandler,
            RelabelTag,
            RelabelTagCommandHandler,
            TagResourceOrNote,
            TagResourceOrNoteCommandHandler,
            // Next time try importing the domain module!
            CreateVideo,
            CreateVideoCommandHandler,
            CreateAudioItem,
            CreateAudioItemCommandHandler,
            CreateTranscript,
            CreateTranscriptCommandHandler,
            AddParticipantToTranscript,
            AddParticipantToTranscriptCommandHandler,
            AddLineItemToTranscript,
            AddLineItemtoTranscriptCommandHandler,
            ImportLineItemsToTranscript,
            ImportLineItemsToTranscriptCommandHandler,
            CreatePlayListCommandHandler,
            ImportAudioItemsToPlaylist,
            ImportAudioItemsToPlaylistCommandHandler,
            AddAudioItemToPlaylistCommandHandler,
            TranslatePlaylistNameCommandHandler,
            CreateNoteAboutResourceCommandHandler,
            ConnectResourcesWithNoteCommandHandler,
            TranslateSongLyrics,
            TranslateSongLyricsCommandHandler,
            TranslateSongTitle,
            TranslateSongTitleCommandHandler,
            CreateTerm,
            CreateTermCommandHandler,
            TranslateTerm,
            TranslateTermCommandHandler,
            CreatePoint,
            CreatePointCommandHandler,
            CreateVocabularyList,
            CreateVocabularyListCommandHandler,
            TranslateLineItem,
            TranslateLineItemCommandHandler,
            TranslateVocabularyListName,
            TranslateVocabularyListNameCommandHandler,
            TranslateVideoName,
            TranslateVideoNameCommandHandler,
        ],

        controllers: [
            ResourceDescriptionController,
            EdgeConnectionController,
            TagController,
            MediaItemController,
            SongController,
            TermController,
            VocabularyListController,
            AudioItemController,
            VideoController,
            BookController,
            PhotographController,
            SpatialFeatureController,
            BibliographicReferenceController,
            PlaylistController,
            CoscradUserGroupController,
            CategoryController,
            CommandController,
            IdGenerationController,
            CoscradUserController,
            AdminController,
        ],
    })
        .overrideProvider(EMPTY_DTO_INJECTION_TOKEN)
        .useValue(null)
        .overrideGuard(OptionalJwtAuthGuard)
        .useValue(new MockJwtAuthGuard(testUserWithGroups, true))
        .overrideGuard(AdminJwtGuard)
        .useValue(new MockJwtAdminAuthGuard(testUserWithGroups))
        .compile()
        .catch((error) => {
            throw new InternalError(error.message);
        });

    await testModule.init();

    return testModule;
};
