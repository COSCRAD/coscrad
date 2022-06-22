import { Module } from '@nestjs/common';
import { IdGenerationController } from '../../app/controllers/id-generation/id-generation.controller';
import { PersistenceModule } from '../../persistence/persistence.module';
import { RepositoryProvider } from '../../persistence/repositories/repository.provider';
import { IdManagementService } from './id-management.service';

@Module({
    imports: [PersistenceModule],
    providers: [
        {
            provide: 'ID_MANAGER',
            useFactory: (repositoryProvider: RepositoryProvider) =>
                new IdManagementService(repositoryProvider.getIdRepository()),
            inject: [RepositoryProvider],
        },
    ],
    controllers: [IdGenerationController],
    exports: ['ID_MANAGER'],
})
export class IdGenerationModule {}
