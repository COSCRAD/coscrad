import { Module } from '@nestjs/common';
import { IdGenerationModule } from '../../../lib/id-generation/id-generation.module';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { PersistenceModule } from '../../../persistence/persistence.module';
import { MediaItemModule } from '../../models/media-item';
import { MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN } from './memory-match.repository.interface';
import { MemoryMatchController } from './queries/memory-match.controller';
import { ArangoMemoryMatchRepository } from './repositories/arango-memory-match-repository';
import { MemoryMatchService } from './services/memory-match.service';

@Module({
    imports: [PersistenceModule, IdGenerationModule, MediaItemModule],
    providers: [
        {
            provide: MEMORY_MATCH_REPOSITORY_INJECTION_TOKEN,
            useFactory: (connectionProvider: ArangoConnectionProvider) =>
                new ArangoMemoryMatchRepository(connectionProvider),
            inject: [ArangoConnectionProvider],
        },
        MemoryMatchService,
    ],
    controllers: [MemoryMatchController],
})
export class MemoryMatchModule {}
