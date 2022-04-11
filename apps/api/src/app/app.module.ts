import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';
import { DomainServicesModule } from '../domain/services/domain-services.module';
import { DatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import { RepositoryProvider } from '../persistence/repositories/repository.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import buildConfigFilePath from './config/buildConfigFilePath';
import { validate } from './config/env.validation';
import { AddTagController } from './controllers/addTag.controller';
import { ResourceViewModelController } from './controllers/resourceViewModel.controller';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: buildConfigFilePath(process.env.NODE_ENV),
            cache: false,
            validate,
        }),
        AuthorizationModule,
        DomainServicesModule,
        PersistenceModule.forRootAsync(),
    ],
    controllers: [AppController, ResourceViewModelController, AddTagController],
    providers: [AppService, DatabaseProvider, RepositoryProvider],
})
export class AppModule {}
