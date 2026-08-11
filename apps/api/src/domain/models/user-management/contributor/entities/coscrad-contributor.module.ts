import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CoscradContributorController } from '../../../../../app/controllers/coscrad-contributor.controller';
import { IdGenerationModule } from '../../../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import { CoscradContributorQueryService } from '../../../../services/query-services/coscrad-contributor-query.service';
import { CreateContributor, CreateContributorCommandHandler } from '../commands/create-contributor';
import { ContributorCreated } from '../commands/create-contributor/contributor-created.event';
import { CoscradContributor } from './coscrad-contributor.entity';

/**
 * NOTE: this module is not in use, see UserManagementModule for contributors
 */

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [CoscradContributorController],
    providers: [
        CreateContributorCommandHandler,
        CoscradContributorQueryService,
        ...[
            // domain model
            CoscradContributor,
            // commands
            CreateContributor,
            // events
            ContributorCreated,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class CoscradContributorModule {}
