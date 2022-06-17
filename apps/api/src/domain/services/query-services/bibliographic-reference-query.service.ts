import {
    CommandInfo,
    CommandInfoService,
} from '../../../app/controllers/command/services/command-info-service';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { BibliographicReferenceViewModel } from '../../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { BookBibliographicReference } from '../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { JournalArticleBibliographicReference } from '../../models/bibliographic-reference/entities/journal-article-bibliographic-reference.entity';
import { IBibliographicReference } from '../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { IBibliographicReferenceData } from '../../models/bibliographic-reference/interfaces/IBibliographicReferenceData';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class BibliographicReferenceQueryService extends BaseQueryService<
    IBibliographicReference,
    BibliographicReferenceViewModel
> {
    constructor(repositoryProvider: RepositoryProvider, commandInfoService: CommandInfoService) {
        super(ResourceType.bibliographicReference, repositoryProvider, commandInfoService);
    }

    buildViewModel(
        bibliographicReferenceInstance: IBibliographicReference<IBibliographicReferenceData>
    ): BibliographicReferenceViewModel {
        return new BibliographicReferenceViewModel(bibliographicReferenceInstance);
    }

    getInfoForIndexScopedCommands(): CommandInfo[] {
        return [BookBibliographicReference, JournalArticleBibliographicReference].flatMap((Ctor) =>
            this.commandInfoService.getCommandInfo(Ctor)
        );
    }
}
