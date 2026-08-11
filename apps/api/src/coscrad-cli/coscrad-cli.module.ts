import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { AppModule } from '../app/app.module';
import { ArangoBulkJobRepository } from '../app/controllers/command/bulk-imports/arango-bulk-job-repository';
import { BULK_JOB_REPOSITORY_INJECTION_TOKEN } from '../app/controllers/command/bulk-imports/bulk-job-repository.interface';
import { CommandExecutionService } from '../app/controllers/command/command-execution.service';
import { EdgeConnectionModule } from '../app/domain-modules/edge-connection.module';
import { TermModule } from '../app/domain-modules/term.module';
import { VocabularyListModule } from '../app/domain-modules/vocabulary-list.module';
import { EventModule } from '../domain/common';
import { AudioVisualModule } from '../domain/models/audio-visual/application/audio-visual.module';
import { MediaItemModule } from '../domain/models/media-item';
import { IdGenerationModule } from '../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { MigrationModule } from '../persistence/migrations';
import { PersistenceModule } from '../persistence/persistence.module';
import { ClearDatabaseCliCommand } from './clear-database.cli-comand';
import { DomainDumpCliCommand } from './data-dump.cli-command';
import { DomainRestoreCliCommand } from './data-restore.cli-command';
import { DiscoverAudioItemsCliCommand } from './discover-audio-items.cli-command';
import { ExecuteCommandStreamCliCommand } from './execute-command-stream.cli-command';
import { ExportAudioItemLineagesCliCommand } from './export-audio-item-lineages.cli-command';
import { ExportContributorsCliCommand } from './export-contributors.cli-command';
import { ExportMediaAnnotationsCliCommand } from './export-media-annotations.cli-command';
import { ExportSchemasCliCommand } from './export-schemas.cli-command';
import { IngestMediaItemsCliCommand } from './ingest-media-items.cli-command';
import { ListMigrationsCliCommand } from './list-migrations.cli-command';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from './logging';
import { ManageBulkJobsCliCommand } from './manage-bulk-jobs.cli-command';
import { RehydrateViewsCliCommand } from './rehydrate-views.cli-command';
import { RevertLatestMigrationCliCommand } from './revert-latest-migration';
import { RunMigrationsCliCommand } from './run-migrations.cli-command';
import { SeedDatabaseCliCommand } from './seed-database.cli-command';
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
        ManageBulkJobsCliCommand,
        SeedDatabaseCliCommand,
        SeedTestDataWithCommand,
        SeedTestUuids,
        IngestMediaItemsCliCommand,
        ExportMediaAnnotationsCliCommand,
        ExportAudioItemLineagesCliCommand,
        ExportSchemasCliCommand,
        RehydrateViewsCliCommand,
        ExportContributorsCliCommand,
        DiscoverAudioItemsCliCommand,
        {
            provide: BULK_JOB_REPOSITORY_INJECTION_TOKEN,
            useFactory: (connectionProvider: ArangoConnectionProvider) => {
                return new ArangoBulkJobRepository(connectionProvider);
            },
            inject: [ArangoConnectionProvider],
        },
        CommandExecutionService,
        {
            provide: COSCRAD_LOGGER_TOKEN,
            useClass: ConsoleCoscradCliLogger,
        },
    ],
    imports: [
        AppModule,
        PersistenceModule,
        IdGenerationModule,
        MigrationModule,
        CommandModule,
        VocabularyListModule,
        AudioVisualModule,
        TermModule,
        MediaItemModule,
        EdgeConnectionModule,
        EventModule,
    ],
})
export class CoscradCliModule {}
