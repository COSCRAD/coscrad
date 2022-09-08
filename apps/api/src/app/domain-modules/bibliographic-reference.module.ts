import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateBookBibliographicReference } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command';
import { CreateBookBibliographicReferenceCommandHandler } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command-handler';
import { BibliographicReferenceQueryService } from '../../domain/services/query-services/bibliographic-reference-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { BibliographicReferenceController } from '../controllers/resources/bibliographic-reference.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule],
    controllers: [BibliographicReferenceController],
    providers: [
        CommandInfoService,
        BibliographicReferenceQueryService,
        CreateBookBibliographicReference,
        CreateBookBibliographicReferenceCommandHandler,
        CommandInfoService,
    ],
})
export class BibliographicReferenceModule {}
