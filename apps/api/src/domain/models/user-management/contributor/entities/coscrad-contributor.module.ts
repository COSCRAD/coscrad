import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { IdGenerationModule } from '../../../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import { CreateContributor, CreateContributorCommandHandler } from '../commands/create-contributor';
import { ContributorCreated } from '../commands/create-contributor/contributor-created.event';
import { CoscradContributor } from './coscrad-contributor.entity';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [],
    providers: [
        CreateContributorCommandHandler,
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
export class CoscradContributorModel {}
