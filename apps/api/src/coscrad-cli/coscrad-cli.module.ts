import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { PersistenceModule } from '../persistence/persistence.module';
import { DomainDumpCliCommand } from './data-dump.cli-command';
import { DomainRestoreCliCommand } from './data-restore.cli-command';
import { ListMigrationsCliCommand } from './list-migrations.cli-command';

@Module({
    providers: [DomainDumpCliCommand, DomainRestoreCliCommand, ListMigrationsCliCommand],
    imports: [AppModule, PersistenceModule],
})
export class CoscradCliModule {}
