import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { BookQueryService } from '../../domain/services/query-services/book-query.service';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { BookController } from '../controllers/resources/book.controller';

@Module({
    imports: [PersistenceModule, CommandModule],
    controllers: [BookController],
    providers: [CommandInfoService, BookQueryService],
})
export class BookModule {}
