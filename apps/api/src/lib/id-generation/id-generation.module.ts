import { forwardRef, Module } from '@nestjs/common';
import { IdGenerationController } from '../../app/controllers/id-generation/id-generation.controller';
import { PersistenceModule } from '../../persistence/persistence.module';
import { IdManagementService } from './id-management.service';

@Module({
    /**
     * TODO Investigate this circular dependency.
     * See [here](https://docs.nestjs.com/fundamentals/circular-dependency)
     */
    imports: [forwardRef(() => PersistenceModule)],
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
