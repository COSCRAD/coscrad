import { Module } from '@nestjs/common';
import { IdGenerationController } from '../../app/controllers/id-generation/id-generation.controller';
import { AggregateId } from '../../domain/types/AggregateId';
import { ArangoConnectionProvider } from '../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../persistence/database/database.provider';
import { PersistenceModule } from '../../persistence/persistence.module';
import { ArangoIdRepository } from '../../persistence/repositories/arango-id-repository';
import { IdManagementService } from './id-management.service';
import { IIdRepository } from './interfaces/id-repository.interface';

@Module({
    imports: [PersistenceModule],
    providers: [
        {
            provide: 'ID_REPOSITORY',
            useFactory: (arangoConnectionProvider: ArangoConnectionProvider) =>
                new ArangoIdRepository(new DatabaseProvider(arangoConnectionProvider)),
            inject: [ArangoConnectionProvider],
        },
        {
            provide: 'ID_MANAGER',
            useFactory: (idRepository: IIdRepository<AggregateId>) =>
                new IdManagementService(idRepository),
            inject: ['ID_REPOSITORY'],
        },
    ],
    controllers: [IdGenerationController],
})
export class IdGenerationModule {}
