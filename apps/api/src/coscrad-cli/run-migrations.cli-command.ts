import { Inject } from '@nestjs/common';
import cloneToPlainObject from '../lib/utilities/cloneToPlainObject';
import { ArangoQueryRunner } from '../persistence/database/arango-query-runner';
import { Migrator } from '../persistence/migrations';
import { ArangoMigrationRecord } from '../persistence/migrations/arango-migration-record';
import { ArangoDataExporter } from '../persistence/repositories/arango-data-exporter';
import { DomainDataExporter } from '../persistence/repositories/domain-data-exporter';
import { CliCommand, CliCommandRunner } from './cli-command.decorator';
import { COSCRAD_LOGGER_TOKEN, ICoscradLogger } from './logging';

@CliCommand({
    description: `runs all available database migrations`,
    name: `run-migrations`,
})
export class RunMigrationsCliCommand extends CliCommandRunner {
    constructor(
        private readonly migrator: Migrator,
        // TODO program to ICoscradQueryRunner and inject at run-time
        private readonly queryRunner: ArangoQueryRunner,
        private readonly domainDataExporter: DomainDataExporter,
        @Inject(COSCRAD_LOGGER_TOKEN) private readonly logger: ICoscradLogger
    ) {
        super();
    }

    async run() {
        const migrationsToRun = await this.migrator.list(this.queryRunner, {
            includeAlreadyRun: false,
        });

        if (migrationsToRun.length === 0) {
            this.logger.log(`No migrations available. Exiting.`);

            return;
        }

        this.logger.log(`Running the following migrations: \n`.concat(migrationsToRun));

        await this.migrator.runAllAvailableMigrations(
            this.queryRunner,
            new ArangoDataExporter(this.queryRunner),
            this.domainDataExporter,
            (migration, metadata) => {
                const instance = new ArangoMigrationRecord(migration, metadata);

                return cloneToPlainObject(instance);
            },
            this.logger
        );
    }
}
