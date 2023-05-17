import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { InternalError } from '../../lib/errors/InternalError';
import { Ctor } from '../../lib/types/Ctor';
import { ICoscradMigration } from './coscrad-migration.interface';
import { CoscradMigrationMetadata, MIGRATION_METADATA } from './decorators/migration.decorator';

export type MigrationCtorAndMeta = {
    metadata: CoscradMigrationMetadata;
    migrationCtor: Ctor<ICoscradMigration>;
};

@Injectable()
export class MigrationFinderService {
    constructor(private readonly discoveryService: DiscoveryService) {}

    async find(): Promise<MigrationCtorAndMeta[]> {
        const migrationProviders = await this.discoveryService.providers(
            (provider) =>
                !!provider.injectType &&
                Reflect.hasMetadata(MIGRATION_METADATA, provider.injectType)
        );

        const migrationCtorsWithMeta = migrationProviders
            .map((provider) => provider.injectType as Ctor<ICoscradMigration>)
            .map((ctor) => {
                const metadata = Reflect.getMetadata(
                    MIGRATION_METADATA,
                    ctor
                ) as CoscradMigrationMetadata;

                if (!metadata) {
                    throw new InternalError(
                        `Failed to find metadata for migration ctor: ${ctor.name}`
                    );
                }

                return {
                    metadata,
                    migrationCtor: ctor,
                };
            });

        return migrationCtorsWithMeta;
    }
}
