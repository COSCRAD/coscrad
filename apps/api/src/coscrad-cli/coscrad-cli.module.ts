import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { IdGenerationModule } from '../lib/id-generation/id-generation.module';
import { MigrationModule } from '../persistence/migrations';
import { PersistenceModule } from '../persistence/persistence.module';
import { ClearDatabaseCliCommand } from './clear-database.cli-comand';
import { DomainDumpCliCommand } from './data-dump.cli-command';
import { DomainRestoreCliCommand } from './data-restore.cli-command';
import { ExecuteCommandStreamCliCommand } from './execute-command-stream.cli-command';
import { IngestMediaItemsCliCommand } from './ingest-media-items.cli-command';
import { ListMigrationsCliCommand } from './list-migrations.cli-command';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from './logging';
import { RevertLatestMigrationCliCommand } from './revert-latest-migration';
import { RunMigrationsCliCommand } from './run-migrations.cli-command';
import { SeedTestDataWithCommand } from './seed-test-data-with-command.cli-command';
import { SeedTestUuids } from './seed-test-uuids.cli-command';
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
        ExecuteCommandStreamCliCommand,
        SeedTestDataWithCommand,
        SeedTestUuids,
        IngestMediaItemsCliCommand,
        {
            provide: COSCRAD_LOGGER_TOKEN,
            useClass: ConsoleCoscradCliLogger,
        },
    ],
    imports: [AppModule, PersistenceModule, IdGenerationModule, MigrationModule, CommandModule],
})
export class CoscradCliModule {}
