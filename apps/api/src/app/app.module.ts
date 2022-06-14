import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';
import { SongModule } from '../domain/models/song/song.module';
import { DatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import { RepositoryProvider } from '../persistence/repositories/repository.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import buildConfigFilePath from './config/buildConfigFilePath';
import { validate } from './config/env.validation';
import { CategoryController } from './controllers/category.controller';
import { CommandController } from './controllers/command/command.controller';
import { CommandInfoService } from './controllers/command/services/command-info-service';
import { EdgeConnectionController } from './controllers/edgeConnection.controller';
import { ResourceViewModelController } from './controllers/resourceViewModel.controller';
import { TagController } from './controllers/tag.controller';
import { MediaItemModule } from './domain-modules/media-item.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: buildConfigFilePath(process.env.NODE_ENV),
            cache: false,
            validate,
        }),
        AuthorizationModule,
        PersistenceModule.forRootAsync(),
        MediaItemModule,
        CommandModule,
        SongModule,
    ],
    controllers: [
        AppController,
        CategoryController,
        ResourceViewModelController,
        EdgeConnectionController,
        TagController,
        CommandController,
    ],
    providers: [AppService, DatabaseProvider, RepositoryProvider, CommandInfoService],
})
export class AppModule {}
