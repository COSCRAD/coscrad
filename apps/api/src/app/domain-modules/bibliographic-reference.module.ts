import { CommandModule } from '@coscrad/commands';
import { Module } from '@nestjs/common';
import { CreateBookBibliographicReference } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command';
import { CreateBookBibliographicReferenceCommandHandler } from '../../domain/models/bibliographic-reference/book-bibliographic-reference/commands/create-book-bibliographic-reference/create-book-bibliographic-reference.command-handler';
import BookBibliographicReferenceData from '../../domain/models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference-data.entity';
import { CreateCourtCaseBibliographicReference } from '../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command';
import { CreateCourtCaseBibliographicReferenceCommandHandler } from '../../domain/models/bibliographic-reference/court-case-bibliographic-reference/commands/create-court-case-bibliographic-reference.command-handler';
import { CourtCaseBibliographicReferenceData } from '../../domain/models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference-data.entity';
import { CreateJournalArticleBibliographicReference } from '../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command';
import { CreateJournalArticleBibliographicReferenceCommandHandler } from '../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/commands/create-journal-article-bibliographic-reference.command-handler';
import JournalArticleBibliographicReferenceData from '../../domain/models/bibliographic-reference/journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference-data.entity';
import { BibliographicReferenceQueryService } from '../../domain/services/query-services/bibliographic-reference-query.service';
import { IdGenerationModule } from '../../lib/id-generation/id-generation.module';
import { PersistenceModule } from '../../persistence/persistence.module';
import { DynamicDataTypeModule } from '../../validation';
import { BibliographicReferenceViewModel } from '../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { CommandInfoService } from '../controllers/command/services/command-info-service';
import { BibliographicReferenceController } from '../controllers/resources/bibliographic-reference.controller';

@Module({
    imports: [PersistenceModule, CommandModule, IdGenerationModule, DynamicDataTypeModule],
    controllers: [BibliographicReferenceController],
    providers: [
        CommandInfoService,
        BibliographicReferenceQueryService,
        CreateBookBibliographicReference,
        CreateBookBibliographicReferenceCommandHandler,
        CreateJournalArticleBibliographicReference,
        CreateJournalArticleBibliographicReferenceCommandHandler,
        CreateCourtCaseBibliographicReference,
        CreateCourtCaseBibliographicReferenceCommandHandler,
        CourtCaseBibliographicReferenceData,
        // Data Classes
        ...[
            BibliographicReferenceViewModel,
            BookBibliographicReferenceData,
            JournalArticleBibliographicReferenceData,
            CourtCaseBibliographicReferenceData,
        ].map((ctor) => ({
            provide: ctor,
            useValue: ctor,
        })),
    ],
})
export class BibliographicReferenceModule {}
