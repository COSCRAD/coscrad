import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { ICoscradMigration } from './coscrad-migration.interface';
import { ICoscradQueryRunner } from './coscrad-query-runner.interface';
import { CoscradMigrationMetadata } from './decorators/migration.decorator';

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

    list(): string {
        return this.getKnownMigrations()
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
        const migrations = this.getKnownMigrations();

        if (migrations.length > 1) {
            throw new InternalError(
                `Not Implemented: Running multiple migrations at once is not yet supported`
            );
        }

        for (const [migrationName, { migration, metadata }] of migrations) {
            console.log(
                `running migration #${migration.sequenceNumber}: ${migrationName} (${migration.name}) [${metadata.dateAuthored}]`
            );

            await migration.up(queryRunner);

            await queryRunner.create('migrations', {
                _key: migration.sequenceNumber.toString(),
                sequenceNumber: migration.sequenceNumber,
                name: migration.name,
                metadata,
                dateApplied: Date.now(),
            });
        }
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
