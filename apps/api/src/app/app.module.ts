import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';
import { EventModule } from '../domain/common';
import { AudioVisualModule } from '../domain/models/audio-visual/application/audio-visual.module';
import { MediaItemModule } from '../domain/models/media-item';
import { PhotographModule } from '../domain/models/photograph/photograph.module';
import { PlaylistModule } from '../domain/models/playlist/playlist.module';
import { IdGenerationModule } from '../lib/id-generation/id-generation.module';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import { ArangoRepositoryProvider } from '../persistence/repositories/arango-repository.provider';
import { DynamicDataTypeModule } from '../validation';
import { AppController } from './app.controller';
import buildConfigFilePath from './config/buildConfigFilePath';
import { validate } from './config/env.validation';
import { CategoryController } from './controllers/category.controller';
import { CommandController } from './controllers/command/command.controller';
import { GameController } from './controllers/command/game.controller';
import { CommandInfoService } from './controllers/command/services/command-info-service';
import { ResourceDescriptionController } from './controllers/resources/resource-description.controller';
import { ResourceUpdateNotificationsController } from './controllers/resources/resource-update-notifications.controller';
import { BibliographicCitationModule } from './domain-modules/bibliographic-citation.module';
import { DigitalTextModule } from './domain-modules/digital-text.module';
import { EdgeConnectionModule } from './domain-modules/edge-connection.module';
import { SongModule } from './domain-modules/song.module';
import { SpatialFeatureModule } from './domain-modules/spatial-feature.module';
import { TagModule } from './domain-modules/tag.module';
import { TermModule } from './domain-modules/term.module';
import { UserManagementModule } from './domain-modules/user-management.module';
import { VocabularyListModule } from './domain-modules/vocabulary-list.module';

@Module({
    providers: [ArangoDatabaseProvider, ArangoRepositoryProvider, CommandInfoService],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: buildConfigFilePath(process.env.NODE_ENV),
            cache: false,
            validate,
        }),
        AuthorizationModule,
        PersistenceModule.forRootAsync(),
        CommandModule,
        EventModule,
        IdGenerationModule,
        UserManagementModule,
        TagModule,
        EdgeConnectionModule,
        MediaItemModule,
        SongModule,
        TermModule,
        VocabularyListModule,
        AudioVisualModule,
        PhotographModule,
        BibliographicCitationModule,
        DigitalTextModule,
        SpatialFeatureModule,
        PlaylistModule,
        DynamicDataTypeModule,
    ],
    controllers: [
        AppController,
        CategoryController,
        ResourceDescriptionController,
        ResourceUpdateNotificationsController,
        CommandController,
        GameController,
    ],
})
export class AppModule {}
