import { Ctor } from '../../lib/types/Ctor';
import { ICoscradMigration } from './coscrad-migration.interface';
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
        return (
            Object.entries(this.knownMigrations)
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
                .map(
                    ([
                        name,
                        {
                            metadata: { description, dateAuthored },
                        },
                    ]: [string, MigrationAndMeta]) => `${name} [${dateAuthored}]: ${description}`
                )
                .join(`\n`)
        );
    }
}
