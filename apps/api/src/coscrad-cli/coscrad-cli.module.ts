import { Logger, Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { MigrationModule } from '../persistence/migrations/migration.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { DomainDumpCliCommand } from './data-dump.cli-command';
import { DomainRestoreCliCommand } from './data-restore.cli-command';
import { ListMigrationsCliCommand } from './list-migrations.cli-command';

@Module({
    providers: [DomainDumpCliCommand, DomainRestoreCliCommand, ListMigrationsCliCommand, Logger],
    imports: [AppModule, PersistenceModule, MigrationModule],
})
export class CoscradCliModule {}
