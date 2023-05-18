import { ICoscradLogger } from '../../coscrad-cli/logging';
import { isNullOrUndefined } from '../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { DTO } from '../../types/DTO';
import { ArangoQueryRunner } from '../database/arango-query-runner';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ArangoDataExporter } from '../repositories/arango-data-exporter';
import { ArangoMigrationRecord } from './arango-migration-record';
import { ICoscradMigration } from './coscrad-migration.interface';
import { ICoscradQueryRunner } from './coscrad-query-runner.interface';
import { CoscradMigrationMetadata } from './decorators/migration.decorator';

export type MigrationAndMeta = {
    metadata: CoscradMigrationMetadata;
    migration: ICoscradMigration;
};

const sortMigrationAndMeta = (
    [
        _,
        {
            migration: { sequenceNumber: a },
        },
    ]: [string, MigrationAndMeta],
    [
        __,
        {
            migration: { sequenceNumber: b },
        },
    ]: [string, MigrationAndMeta]
) => b - a;

export class Migrator {
    private readonly knownMigrations: Map<string, MigrationAndMeta> = new Map();

    register(migration: Ctor<ICoscradMigration>, metadata: CoscradMigrationMetadata): Migrator {
        const instance = new migration();

        this.knownMigrations.set(instance.name, {
            migration: instance,
            metadata,
        });

        return this;
    }

    async list(
        queryRunner: ICoscradQueryRunner,
        { includeAlreadyRun = false }: { includeAlreadyRun: boolean }
    ): Promise<string> {
        const migrationsToList = includeAlreadyRun
            ? this.getKnownMigrations()
            : await this.getAvailableMigrations(queryRunner);

        return migrationsToList
            .map(
                ([
                    name,
                    {
                        metadata: { description, dateAuthored },
                    },
                ]: [string, MigrationAndMeta]) => `${name} [${dateAuthored}]: ${description}`
            )
            .join(`\n`);
    }

    /**
     * In the future, we may want to abstract over the persistence mechanism.
     * this is only really helpful in the event that we introduce a second
     * option for backing database. Most of the complexity is around abstracting
     * over the way identity is represented in Arango, i.e. maintaining a
     * COSCRAD persistence layer independent of the Arango persistence layer.
     */
    async runAllAvailableMigrations(
        queryRunner: ArangoQueryRunner,
        dataExporter: ArangoDataExporter,
        buildMigrationRecord: (
            migration: ICoscradMigration,
            metadata: CoscradMigrationMetadata
        ) => DTO<ArangoMigrationRecord>
    ): Promise<void> {
        const migrations = await this.getAvailableMigrations(queryRunner);

        if (migrations.length > 1) {
            throw new InternalError(
                `Not Implemented: Running multiple migrations at once is not yet supported`
            );
        }

        for (const [migrationName, { migration, metadata }] of migrations) {
            // TODO Use the actual logger for this
            console.log(
                `running migration #${migration.sequenceNumber}: ${migrationName} (${migration.name}) [${metadata.dateAuthored}]`
            );

            const migrationDirectoryName = `migration-${migration.sequenceNumber}-${
                migration.name
            }-${Date.now()}`;

            await dataExporter.dumpSnapshot(migrationDirectoryName, 'pre.data.json');

            await migration.up(queryRunner);

            await dataExporter.dumpSnapshot(migrationDirectoryName, 'post.data.json');

            await queryRunner.create('migrations', buildMigrationRecord(migration, metadata));
        }
    }

    async revertLatestMigration(
        queryRunner: ArangoQueryRunner,
        dataExporter: ArangoDataExporter,
        logger: ICoscradLogger
    ): Promise<void> {
        const alreadyRunMigrations = await this.fetchAlreadyRunMigrationRecords(queryRunner);

        const latestMigrationRecord = alreadyRunMigrations.sort(
            (
                { sequenceNumber: a }: ArangoMigrationRecord,
                { sequenceNumber: b }: ArangoMigrationRecord
            ) => a - b
        )?.[0];

        if (isNullOrUndefined(latestMigrationRecord)) {
            logger.log(`No migrations found.`);

            return;
        }

        const { migration: latestMigration, metadata } = this.knownMigrations.get(
            latestMigrationRecord.name
        );

        logger.log(
            `**REVERTING** migration #${latestMigration.sequenceNumber}: ${latestMigration.name}  [${metadata.dateAuthored}]`
        );

        const migrationDirectoryName = `migration-REVERT-${latestMigration.sequenceNumber}-${
            latestMigration.name
        }-${Date.now()}`;

        await dataExporter.dumpSnapshot(migrationDirectoryName, 'pre-revert.data.json');

        await latestMigration.down(queryRunner);

        await dataExporter.dumpSnapshot(migrationDirectoryName, 'post-revert.data.json');

        await queryRunner.delete('migrations', latestMigrationRecord._key);
    }

    private async fetchAlreadyRunMigrationRecords(
        queryRunner: ICoscradQueryRunner
    ): Promise<ArangoMigrationRecord[]> {
        const alreadyRunMigrations = await queryRunner.fetchMany<ArangoMigrationRecord>(
            ArangoCollectionId.migrations
        );

        return alreadyRunMigrations;
    }

    private async getAvailableMigrations(
        queryRunner: ICoscradQueryRunner
    ): Promise<[string, MigrationAndMeta][]> {
        const alreadyRunMigrations = await this.fetchAlreadyRunMigrationRecords(queryRunner);

        const sequenceNumbersOfMigrationsToExclude = alreadyRunMigrations.map(
            ({ sequenceNumber }) => sequenceNumber
        );

        return this.getKnownMigrations().filter(
            ([
                _name,
                {
                    migration: { sequenceNumber },
                },
            ]) => !sequenceNumbersOfMigrationsToExclude.includes(sequenceNumber)
        );
    }

    private getKnownMigrations(): [string, MigrationAndMeta][] {
        const labelAndMigrationDataPairs = [...this.knownMigrations];

        return (
            labelAndMigrationDataPairs
                // sort with most recent (highest sequence number) first
                .sort(sortMigrationAndMeta)
        );
    }
}
