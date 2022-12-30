import { CommandModule } from '@coscrad/commands';
import { ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { Test } from '@nestjs/testing';
import { JwtStrategy } from '../../../authorization/jwt.strategy';
import { MockJwtAdminAuthGuard } from '../../../authorization/mock-jwt-admin-auth-guard';
import { MockJwtAuthGuard } from '../../../authorization/mock-jwt-auth-guard';
import { MockJwtStrategy } from '../../../authorization/mock-jwt.strategy';
import { OptionalJwtAuthGuard } from '../../../authorization/optional-jwt-auth-guard';
import { CreateBookBibliographicReference } from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command';
import { CreateBookBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command-handler';
import { CreateCourtCaseBibliographicReference } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command';
import { CreateCourtCaseBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command-handler';
import { CreateJournalArticleBibliographicReference } from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command';
import { CreateJournalArticleBibliographicReferenceCommandHandler } from '../../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command-handler';
import { CreateMediaItem } from '../../../domain/models/media-item/commands/create-media-item.command';
import { CreateMediaItemCommandHandler } from '../../../domain/models/media-item/commands/create-media-item.command-handler';
import {
    PublishResource,
    PublishResourceCommandHandler,
} from '../../../domain/models/shared/common-commands';
import { GrantResourceReadAccessToUser } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command';
import { GrantResourceReadAccessToUserCommandHandler } from '../../../domain/models/shared/common-commands/grant-user-read-access/grant-resource-read-access-to-user.command-handler';
import { CreateSong } from '../../../domain/models/song/commands/create-song.command';
import { CreateSongCommandHandler } from '../../../domain/models/song/commands/create-song.command-handler';
import { CreateTag } from '../../../domain/models/tag/commands/create-tag.command';
import { CreateTagCommandHandler } from '../../../domain/models/tag/commands/create-tag.command-handler';
import {
    RelabelTag,
    RelabelTagCommandHandler,
} from '../../../domain/models/tag/commands/relabel-tag';
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
import { BibliographicReferenceQueryService } from '../../../domain/services/query-services/bibliographic-reference-query.service';
import { BookQueryService } from '../../../domain/services/query-services/book-query.service';
import { CoscradUserGroupQueryService } from '../../../domain/services/query-services/coscrad-user-group-query.service';
import { CoscradUserQueryService } from '../../../domain/services/query-services/coscrad-user-query.service';
import { EdgeConnectionQueryService } from '../../../domain/services/query-services/edge-connection-query.service';
import { MediaItemQueryService } from '../../../domain/services/query-services/media-item-query.service';
import { PhotographQueryService } from '../../../domain/services/query-services/photograph-query.service';
import { SongQueryService } from '../../../domain/services/query-services/song-query.service';
import { SpatialFeatureQueryService } from '../../../domain/services/query-services/spatial-feature-query.service';
import { TagQueryService } from '../../../domain/services/query-services/tag-query.service';
import { TermQueryService } from '../../../domain/services/query-services/term-query.service';
import { TranscribedAudioQueryService } from '../../../domain/services/query-services/transribed-audio-query.service';
import { VocabularyListQueryService } from '../../../domain/services/query-services/vocabulary-list-query.service';
import { InternalError } from '../../../lib/errors/InternalError';
import { IdManagementService } from '../../../lib/id-generation/id-management.service';
import { MockIdManagementService } from '../../../lib/id-generation/mock-id-management.service';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { DTO } from '../../../types/DTO';
import buildConfigFilePath from '../../config/buildConfigFilePath';
import { Environment } from '../../config/constants/Environment';
import { EnvironmentVariables } from '../../config/env.validation';
import buildMockConfigServiceSpec from '../../config/__tests__/utilities/buildMockConfigService';
import { AdminController } from '../admin.controller';
import { CategoryController } from '../category.controller';
import { AdminJwtGuard, CommandController } from '../command/command.controller';
import { CommandInfoService } from '../command/services/command-info-service';
import { CoscradUserGroupController } from '../coscrad-user-group.controller';
import { CoscradUserController } from '../coscrad-user.controller';
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

type CreateTestModuleOptions = {
    shouldMockIdGenerator: boolean;
    testUserWithGroups?: CoscradUserWithGroups;
};

// If not specified, there will be no test user attached to requests
const optionDefaults = { shouldMockIdGenerator: false };

export default async (
    configOverrides: Partial<DTO<EnvironmentVariables>>,
    userOptions: Partial<CreateTestModuleOptions> = optionDefaults
) => {
    const { shouldMockIdGenerator, testUserWithGroups } = {
        ...optionDefaults,
        ...userOptions,
    };

    const testModule = await Test.createTestingModule({
        imports: [CommandModule, PassportModule.register({ defaultStrategy: 'jwt' })],
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
                provide: EdgeConnectionQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService,
                    configService: ConfigService
                ) =>
                    new EdgeConnectionQueryService(
                        repositoryProvider,
                        commandInfoService,
                        configService
                    ),
                inject: [RepositoryProvider, CommandInfoService, ConfigService],
            },
            {
                provide: TagQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new TagQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
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
                provide: CoscradUserGroupQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new CoscradUserGroupQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: CoscradUserQueryService,
                useFactory: (
                    repositoryProvider: RepositoryProvider,
                    commandInfoService: CommandInfoService
                ) => new CoscradUserQueryService(repositoryProvider, commandInfoService),
                inject: [RepositoryProvider, CommandInfoService],
            },
            {
                provide: 'ID_MANAGER',
                useFactory: (repositoryProvider: RepositoryProvider) =>
                    shouldMockIdGenerator
                        ? new MockIdManagementService(repositoryProvider.getIdRepository())
                        : new IdManagementService(repositoryProvider.getIdRepository()),
                inject: [RepositoryProvider],
            },
            {
                provide: JwtStrategy,
                useFactory: () => new MockJwtStrategy(testUserWithGroups),
            },
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
            // Next time try importing the domain module!
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
            CoscradUserGroupController,
            CategoryController,
            CommandController,
            IdGenerationController,
            CoscradUserController,
            AdminController,
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

    return testModule;
};
