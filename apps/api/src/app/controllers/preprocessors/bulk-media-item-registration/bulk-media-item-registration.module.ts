import { Module } from '@nestjs/common';
import { IdGenerationModule } from '../../../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import { BulkMediaItemRegistrationController } from './bulk-media-item-registration.controller';

@Module({
    imports: [PersistenceModule, IdGenerationModule],
    controllers: [BulkMediaItemRegistrationController],
})
export class BulkMediaItemRegistrationModule {}
