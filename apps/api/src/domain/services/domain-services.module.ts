import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseModule } from '../../persistence/database/database.module';
import { DatabaseProvider } from '../../persistence/database/database.provider';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';

// This is just a placeholder for now
@Module({
  imports: [DatabaseModule],
  controllers: [],
  providers: [DatabaseProvider, RepositoryProvider, ConfigService],
})
export class DomainServicesModule {}
