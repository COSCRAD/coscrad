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
import { AudioItemController } from '../../../domain/models/audio-visual/application/audio-item.controller';
import { VideoController } from '../../../domain/models/audio-visual/application/video.controller';
import {
    AddLineItemToTranscript,
    AddLineItemtoTranscriptCommandHandler,
    CreateAudioItem,
    CreateAudioItemCommandHandler,
    CreateTranscript,
    CreateTranscriptCommandHandler,
    TranslateAudioItemName,
    TranslateAudioItemNameCommandHandler,
    TranslateLineItem,
    TranslateLineItemCommandHandler,
} from '../../../domain/models/audio-visual/audio-item/commands';
import {
    ImportLineItemsToTranscript,
    ImportLineItemsToTranscriptCommandHandler,
    ImportTranslationsForTranscript,
    ImportTranslationsForTranscriptCommandHandler,
} from '../../../domain/models/audio-visual/shared/commands/transcripts';
import {
    AddParticipantToTranscript,
    AddParticipantToTranscriptCommandHandler,
} from '../../../domain/models/audio-visual/shared/commands/transcripts/add-participant-to-transcript';
import {
    CreateVideo,
    CreateVideoCommandHandler,
    TranslateVideoName,
    TranslateVideoNameCommandHandler,
} from '../../../domain/models/audio-visual/video';
import { CreateBookBibliographicCitation } from '../../../domain/models/bibliographic-citation/book-bibliographic-citation/commands/create-book-bibliographic-citation/create-book-bibliographic-citation.command';
import { CreateBookBibliographicCitationCommandHandler } from '../../../domain/models/bibliographic-citation/book-bibliographic-citation/commands/create-book-bibliographic-citation/create-book-bibliographic-citation.command-handler';
import BookBibliographicCitationData from '../../../domain/models/bibliographic-citation/book-bibliographic-citation/entities/book-bibliographic-citation-data.entity';
import { RegisterDigitalRepresentationOfBibliographicCitation } from '../../../domain/models/bibliographic-citation/common/commands/register-digital-representation-of-bibiliographic-citation';
import { RegisterDigitalRepresentationOfBibliographicCitationCommandHandler } from '../../../domain/models/bibliographic-citation/common/commands/register-digital-representation-of-bibiliographic-citation/register-digital-representation-of-bibliographic-citation.command-handler';
import { CreateCourtCaseBibliographicCitation } from '../../../domain/models/bibliographic-citation/court-case-bibliographic-citation/commands/create-court-case-bibliographic-citation/create-court-case-bibliographic-citation.command';
import { CreateCourtCaseBibliographicCitationCommandHandler } from '../../../domain/models/bibliographic-citation/court-case-bibliographic-citation/commands/create-court-case-bibliographic-citation/create-court-case-bibliographic-citation.command-handler';
import { CourtCaseBibliographicCitationData } from '../../../domain/models/bibliographic-citation/court-case-bibliographic-citation/entities/court-case-bibliographic-citation-data.entity';
import { CreateJournalArticleBibliographicCitation } from '../../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/commands/create-journal-article-bibliographic-citation.command';
import { CreateJournalArticleBibliographicCitationCommandHandler } from '../../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/commands/create-journal-article-bibliographic-citation.command-handler';
import JournalArticleBibliographicCitationData from '../../../domain/models/bibliographic-citation/journal-article-bibliographic-citation/entities/journal-article-bibliographic-citation-data.entity';
import { BibliographicCitationDataUnion } from '../../../domain/models/bibliographic-citation/shared';
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
import { FreeMultilineContext } from '../../../domain/models/context/free-multiline-context/free-multiline-context.entity';
import { GeneralContext } from '../../../domain/models/context/general-context/general-context.entity';
import { PageRangeContext } from '../../../domain/models/context/page-range-context/page-range.context.entity';
import { PointContext } from '../../../domain/models/context/point-context/point-context.entity';
import { TextFieldContext } from '../../../domain/models/context/text-field-context/text-field-context.entity';
import { TimeRangeContext } from '../../../domain/models/context/time-range-context/time-range-context.entity';
import {
    AddAudioForDigitalTextPage,
    AddAudioForDigitalTextPageCommandHandler,
    AddAudioForDigitalTextTitle,
    AddAudioForDigitalTextTitleCommandHandler,
    AddCoverPhotographForDigitalText,
    AddCoverPhotographForDigitalTextCommandHandler,
    AddPageToDigitalTextCommandHandler,
    AudioAddedForDigitalTextPage,
    AudioAddedForDigitalTextTitle,
    CoverPhotographAddedForDigitalText,
    CreateDigitalText,
    CreateDigitalTextCommandHandler,
    DigitalTextCreated,
    DigitalTextPageContentTranslated,
    DigitalTextTitleTranslated,
    PageAddedToDigitalText,
    TranslateDigitalTextPageContent,
    TranslateDigitalTextPageContentCommandHandler,
    TranslateDigitalTextTitleCommandHandler,
} from '../../../domain/models/digital-text/commands';
import {
    AddContentToDigitalTextPage,
    AddContentToDigitalTextPageCommandHandler,
    ContentAddedToDigitalTextPage,
} from '../../../domain/models/digital-text/commands/add-content-to-digital-text-page';
import { AddPageToDigitalText } from '../../../domain/models/digital-text/commands/add-page-to-digital-text/add-page-to-digital-text.command';
import {
    AddPhotographToDigitalTextPage,
    AddPhotographToDigitalTextPageCommandHandler,
    PhotographAddedToDigitalTextPage,
} from '../../../domain/models/digital-text/commands/add-photograph-to-digital-text-page';
import { DigitalText } from '../../../domain/models/digital-text/entities/digital-text.entity';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item/create-media-item.command';
import { CreateMediaItemCommandHandler } from '../../../domain/models/media-item/commands/create-media-item/create-media-item.command-handler';
import {
    CreatePhotograph,
    CreatePhotographCommandHandler,
    PhotographCreated,
} from '../../../domain/models/photograph';
import {
    AddAudioItemToPlaylistCommandHandler,
    CreatePlayListCommandHandler,
    ImportAudioItemsToPlaylist,
    ImportAudioItemsToPlaylistCommandHandler,
    TranslatePlaylistNameCommandHandler,
} from '../../../domain/models/playlist/commands';
import {
    GrantResourceReadAccessToUser,
    GrantResourceReadAccessToUserCommandHandler,
    PublishResource,
    PublishResourceCommandHandler,
    ResourceReadAccessGrantedToUser,
} from '../../../domain/models/shared/common-commands';
import { ResourcePublished } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import {
    AddLyricsForSong,
    AddLyricsForSongCommandHandler,
    CreateSong,
    CreateSongCommandHandler,
    LyricsAddedForSong,
    SongCreated,
    SongLyricsTranslated,
    SongTitleTranslated,
    TranslateSongLyrics,
    TranslateSongLyricsCommandHandler,
    TranslateSongTitle,
    TranslateSongTitleCommandHandler,
} from '../../../domain/models/song/commands';
import { Song } from '../../../domain/models/song/song.entity';
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
import { TagCreated } from '../../../domain/models/tag/commands/create-tag/tag-created.event';
import { ResourceOrNoteTagged } from '../../../domain/models/tag/commands/tag-resource-or-note/resource-or-note-tagged.event';
import {
    AddAudioForTerm,
    AddAudioForTermCommandHandler,
    AudioAddedForTerm,
    CreatePromptTerm,
    CreatePromptTermCommandHandler,
    CreateTerm,
    CreateTermCommandHandler,
    ElicitTermFromPrompt,
    ElicitTermFromPromptCommandHandler,
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
    TranslateTerm,
    TranslateTermCommandHandler,
} from '../../../domain/models/term/commands';
import { Term } from '../../../domain/models/term/entities/term.entity';
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
    AddTermToVocabularyList,
    AddTermToVocabularyListCommandHandler,
    AnalyzeTermInVocabularyList,
    AnalyzeTermInVocabularyListCommandHandler,
    CreateVocabularyList,
    CreateVocabularyListCommandHandler,
    RegisterVocabularyListFilterProperty,
    RegisterVocabularyListFilterPropertyCommandHandler,
    TranslateVocabularyListName,
    TranslateVocabularyListNameCommandHandler,
} from '../../../domain/models/vocabulary-list/commands';
import { AudioItemQueryService } from '../../../domain/services/query-services/audio-item-query.service';
import { BibliographicCitationQueryService } from '../../../domain/services/query-services/bibliographic-citation-query.service';
import { CoscradUserGroupQueryService } from '../../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../../domain/services/query-services/coscrad-user-query.service';
import { EdgeConnectionQueryService } from '../../../domain/services/query-services/edge-connection-query.service';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-management/media-item-query.service';
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
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { ArangoEventRepository } from '../../../persistence/repositories/arango-event-repository';
import { ArangoIdRepository } from '../../../persistence/repositories/arango-id-repository';
import { ArangoRepositoryProvider } from '../../../persistence/repositories/arango-repository.provider';
import { BibliographicCitationViewModel } from '../../../queries/buildViewModelForResource/viewModels/bibliographic-citation/bibliographic-citation.view-model';
import { DigitalTextQueryService } from '../../../queries/digital-text';
import { DigitalTextQueryRepository } from '../../../queries/digital-text/digital-text.query-repository';
import { NoteViewModel } from '../../../queries/edgeConnectionViewModels/note.view-model';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../validation';
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
import { EdgeConnectionController } from '../edge-connection.controller';
import { IdGenerationController } from '../id-generation/id-generation.controller';
import { BibliographicCitationController } from '../resources/bibliographic-citation.controller';
import { DigitalTextQueryController } from '../resources/digital-text.controller';
import { MediaItemController } from '../resources/media-item.controller';
import { PhotographController } from '../resources/photograph.controller';
import { PlaylistController } from '../resources/playlist.controller';
import { ResourceDescriptionController } from '../resources/resource-description.controller';
import { SongController } from '../resources/song.controller';
import { SpatialFeatureController } from '../resources/spatial-feature.controller';
import { TermController } from '../resources/term.controller';
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
        // Bibliographic Citations
        BibliographicCitationDataUnion,
        BibliographicCitationViewModel,
        CourtCaseBibliographicCitationData,
        JournalArticleBibliographicCitationData,
        BookBibliographicCitationData,
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
        // Events
        CoscradEventUnion,
        ResourceReadAccessGrantedToUser,
        DigitalTextCreated,
        PageAddedToDigitalText,
        CoverPhotographAddedForDigitalText,
        AudioAddedForDigitalTextTitle,
        ContentAddedToDigitalTextPage,
        DigitalTextPageContentTranslated,
        DigitalTextTitleTranslated,
        AudioAddedForDigitalTextPage,
        PhotographAddedToDigitalTextPage,
        SongCreated,
        SongTitleTranslated,
        LyricsAddedForSong,
        SongLyricsTranslated,
        ResourcePublished,
        TagCreated,
        ResourceOrNoteTagged,
        TermCreated,
        TermTranslated,
        PromptTermCreated,
        AudioAddedForTerm,
        TermElicitedFromPrompt,
        PhotographCreated,
        // Aggregate Root Domain Models
        DigitalText,
        Song,
        Term,
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
                    coscradEventFactory: CoscradEventFactory,
                    dynamicDataTypeFinderService: DynamicDataTypeFinderService
                ) => {
                    return new ArangoRepositoryProvider(
                        new ArangoDatabaseProvider(arangoConnectionProvider),
                        coscradEventFactory,
                        dynamicDataTypeFinderService
                    );
                },
                inject: [
                    ArangoConnectionProvider,
                    CoscradEventFactory,
                    DynamicDataTypeFinderService,
                ],
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
                provide: BibliographicCitationQueryService,
                useFactory: (
                    repositoryProvider: ArangoRepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new BibliographicCitationQueryService(repositoryProvider, commandInfoService),
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
                provide: DigitalTextQueryService,
                useFactory: (
                    eventRepository: ArangoEventRepository,
                    commandInfoService: CommandInfoService
                ) =>
                    new DigitalTextQueryService(
                        new DigitalTextQueryRepository(eventRepository),
                        commandInfoService
                    ),

                inject: [ArangoEventRepository, CommandInfoService],
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
            {
                provide: TestRepositoryProvider,
                useFactory: (
                    arangoConnectionProvider,
                    coscradEventFactory,
                    dynamicDataTypeFinderService
                ) =>
                    new TestRepositoryProvider(
                        new ArangoDatabaseProvider(arangoConnectionProvider),
                        coscradEventFactory,
                        dynamicDataTypeFinderService
                    ),
                inject: [
                    ArangoConnectionProvider,
                    CoscradEventFactory,
                    DynamicDataTypeFinderService,
                ],
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
            CreateBookBibliographicCitation,
            CreateBookBibliographicCitationCommandHandler,
            CreateCourtCaseBibliographicCitation,
            CreateCourtCaseBibliographicCitationCommandHandler,
            CreateJournalArticleBibliographicCitation,
            CreateJournalArticleBibliographicCitationCommandHandler,
            RegisterDigitalRepresentationOfBibliographicCitation,
            RegisterDigitalRepresentationOfBibliographicCitationCommandHandler,
            CreateDigitalText,
            CreateDigitalTextCommandHandler,
            AddPageToDigitalText,
            AddPageToDigitalTextCommandHandler,
            AddPhotographToDigitalTextPage,
            AddPhotographToDigitalTextPageCommandHandler,
            AddCoverPhotographForDigitalText,
            AddCoverPhotographForDigitalTextCommandHandler,
            TranslateDigitalTextPageContent,
            TranslateDigitalTextPageContentCommandHandler,
            TranslateDigitalTextPageContent,
            TranslateDigitalTextTitleCommandHandler,
            AddAudioForDigitalTextPage,
            AddAudioForDigitalTextPageCommandHandler,
            AddAudioForDigitalTextTitle,
            AddAudioForDigitalTextTitleCommandHandler,
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
            ImportTranslationsForTranscript,
            ImportTranslationsForTranscriptCommandHandler,
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
            CreatePromptTerm,
            CreatePromptTermCommandHandler,
            ElicitTermFromPrompt,
            ElicitTermFromPromptCommandHandler,
            TranslateTerm,
            TranslateTermCommandHandler,
            AddAudioForTerm,
            AddAudioForTermCommandHandler,
            CreatePoint,
            CreatePointCommandHandler,
            CreateVocabularyList,
            CreateVocabularyListCommandHandler,
            TranslateLineItem,
            TranslateLineItemCommandHandler,
            TranslateVocabularyListName,
            TranslateVocabularyListNameCommandHandler,
            RegisterVocabularyListFilterProperty,
            RegisterVocabularyListFilterPropertyCommandHandler,
            AddTermToVocabularyList,
            AddTermToVocabularyListCommandHandler,
            AnalyzeTermInVocabularyList,
            AnalyzeTermInVocabularyListCommandHandler,
            TranslateVideoName,
            TranslateVideoNameCommandHandler,
            TranslateAudioItemName,
            TranslateAudioItemNameCommandHandler,
            AddPageToDigitalText,
            AddPageToDigitalTextCommandHandler,
            AddContentToDigitalTextPage,
            AddContentToDigitalTextPageCommandHandler,
            CreatePhotograph,
            CreatePhotographCommandHandler,
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
            PhotographController,
            SpatialFeatureController,
            BibliographicCitationController,
            PlaylistController,
            CoscradUserGroupController,
            CategoryController,
            CommandController,
            IdGenerationController,
            CoscradUserController,
            AdminController,
            DigitalTextQueryController,
        ],
    })
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
