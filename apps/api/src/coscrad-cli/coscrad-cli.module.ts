import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { MigrationModule } from '../persistence/migrations';
import { PersistenceModule } from '../persistence/persistence.module';
import { ClearDatabaseCliCommand } from './clear-database.cli-comand';
import { DomainDumpCliCommand } from './data-dump.cli-command';
import { DomainRestoreCliCommand } from './data-restore.cli-command';
import { ListMigrationsCliCommand } from './list-migrations.cli-command';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from './logging';
import { RevertLatestMigrationCliCommand } from './revert-latest-migration';
import { RunMigrationsCliCommand } from './run-migrations.cli-command';
import { ValidateInvariantsCliCommand } from './validate-invariants.cli-command';

@Module({
    providers: [
        DomainDumpCliCommand,
        DomainRestoreCliCommand,
        ListMigrationsCliCommand,
        RunMigrationsCliCommand,
        RevertLatestMigrationCliCommand,
        ValidateInvariantsCliCommand,
        ClearDatabaseCliCommand,
        {
            provide: COSCRAD_LOGGER_TOKEN,
            useClass: ConsoleCoscradCliLogger,
        },
    ],
    imports: [AppModule, PersistenceModule, MigrationModule],
})
export class CoscradCliModule {}
