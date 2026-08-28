import { Injectable } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { Ctor } from '../../lib/types/Ctor';
import { ICoscradMigration } from './coscrad-migration.interface';
import { CoscradMigrationMetadata, MIGRATION_METADATA } from './decorators/migration.decorator';

export type MigrationCtorAndMeta = {
    metadata: CoscradMigrationMetadata;
    migrationCtor: Ctor<ICoscradMigration>;
};

@Injectable()
export class MigrationFinderService {
    constructor(
        private readonly modulesContainer: ModulesContainer,
        private readonly reflector: Reflector
    ) {}

    async find(): Promise<MigrationCtorAndMeta[]> {
        const migrationCtorsWithMeta: MigrationCtorAndMeta[] = [];

        // Iterate through all modules registered in the application
        for (const moduleInstance of this.modulesContainer.values()) {
            // Iterate through all providers within each module
            for (const wrapper of moduleInstance.providers.values()) {
                const ctor = wrapper.metatype;

                if (!ctor) {
                    continue;
                }

                const metadata = this.reflector.get<
                    CoscradMigrationMetadata,
                    typeof MIGRATION_METADATA
                >(MIGRATION_METADATA, ctor);

                if (metadata) {
                    migrationCtorsWithMeta.push({
                        metadata,
                        migrationCtor: ctor as Ctor<ICoscradMigration>,
                    });
                }
            }
        }

        return migrationCtorsWithMeta;
    }
}
