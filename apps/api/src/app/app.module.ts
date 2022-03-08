import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthorizationModule } from '../authorization/authorization.module';
import { DomainServicesModule } from '../domain/services/domain-services.module';
import { DatabaseProvider } from '../persistence/database/database.provider';
import { RepositoryProvider } from '../persistence/repositories/repository.provider';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AddTagController } from './controllers/addTag.controller';
import { EntityViewModelController } from './controllers/entityViewModel.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `${process.cwd()}/apps/api/src/app/config/${
        process.env.NODE_ENV
      }.env`,
      cache: false,
    }),
    AuthorizationModule,
    DomainServicesModule,
    // ServeStaticModule.forRoot({
    //   // TODO get this from the config
    //   rootPath: join(__dirname, '.', 'public'),
    // }),
  ],
  controllers: [AppController, EntityViewModelController, AddTagController],
  providers: [AppService, DatabaseProvider, RepositoryProvider],
})
export class AppModule {}
