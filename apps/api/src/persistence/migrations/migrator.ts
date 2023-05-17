import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { ArangoCollectionId } from '../database/collection-references/ArangoCollectionId';
import { ICoscradMigration } from './coscrad-migration.interface';
import { ICoscradQueryRunner } from './coscrad-query-runner.interface';
import { CoscradMigrationMetadata } from './decorators/migration.decorator';
import { ArangoMigrationRecord } from './migration-record';

export type MigrationAndMeta = {
    metadata: CoscradMigrationMetadata;
    migration: ICoscradMigration;
};

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

    async runAllAvailableMigrations(queryRunner: ICoscradQueryRunner): Promise<void> {
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

            await migration.up(queryRunner);

            await queryRunner.create(
                'migrations',
                new ArangoMigrationRecord(migration, metadata).toDTO()
            );
        }
    }

    private async getAvailableMigrations(
        queryRunner: ICoscradQueryRunner
    ): Promise<[string, MigrationAndMeta][]> {
        const alreadyRunMigrations = await queryRunner.fetchMany<ArangoMigrationRecord>(
            ArangoCollectionId.migrations
        );

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
                .sort(
                    (
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
                    ) => b - a
                )
        );
    }
}
