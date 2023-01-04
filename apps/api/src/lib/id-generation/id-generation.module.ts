import { Module } from '@nestjs/common';
import { IdGenerationController } from '../../app/controllers/id-generation/id-generation.controller';
import { PersistenceModule } from '../../persistence/persistence.module';
import { IdManagementService } from './id-management.service';

@Module({
    imports: [PersistenceModule],
    providers: [
        {
            provide: 'ID_MANAGER',
            useClass: IdManagementService,
        },
    ],
    controllers: [IdGenerationController],
    exports: ['ID_MANAGER'],
})
export class IdGenerationModule {}
