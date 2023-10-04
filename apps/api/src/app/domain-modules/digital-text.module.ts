import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
})
export class DigitalTextModule {}
