import { Module, OnApplicationBootstrap } from '@nestjs/common';
import { PersistenceModule } from '../persistence.module';
import { RemoveBaseDigitalAssetUrl } from './01/remove-base-digital-asset-url.migration';
import { MigrationFinderService } from './migration-finder.service';
import { Migrator } from './migrator';

@Module({
    imports: [PersistenceModule],
    providers: [Migrator, RemoveBaseDigitalAssetUrl],
})
export class MigrationModule implements OnApplicationBootstrap {
    constructor(
        private readonly finderService: MigrationFinderService,
        private readonly migrator: Migrator
    ) {}

    async onApplicationBootstrap() {
        const migrationCtorsAndMetadata = await this.finderService.find();

        migrationCtorsAndMetadata.forEach(({ metadata, migrationCtor }) => {
            this.migrator.register(migrationCtor, metadata);
        });
    }
}
