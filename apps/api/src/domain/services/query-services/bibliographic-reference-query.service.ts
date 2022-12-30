import { IBibliographicReferenceViewModel, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { BibliographicReferenceViewModel } from '../../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { BookBibliographicReference } from '../../models/bibliographic-reference/book-bibliographic-reference/entities/book-bibliographic-reference.entity';
import { CourtCaseBibliographicReference } from '../../models/bibliographic-reference/court-case-bibliographic-reference/entities/court-case-bibliographic-reference.entity';
import { IBibliographicReferenceData } from '../../models/bibliographic-reference/interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { JournalArticleBibliographicReference } from '../../models/bibliographic-reference/journal-article-bibliographic-reference/entities/journal-article-bibliographic-reference.entity';
import { ResourceType } from '../../types/ResourceType';
import { ResourceQueryService } from './resource-query.service';

export class BibliographicReferenceQueryService extends ResourceQueryService<
    IBibliographicReference,
    IBibliographicReferenceViewModel
> {
    protected readonly type = ResourceType.bibliographicReference;

    buildViewModel(
        bibliographicReferenceInstance: IBibliographicReference<IBibliographicReferenceData>
    ): IBibliographicReferenceViewModel {
        return new BibliographicReferenceViewModel(bibliographicReferenceInstance);
    }

    /**
     * We may want to have a `BibliographicReference` base class or some other
     * mechanism to make the following method closed to modification.
     */
    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return [
            BookBibliographicReference,
            JournalArticleBibliographicReference,
            CourtCaseBibliographicReference,
        ].flatMap((Ctor) => this.commandInfoService.getCommandInfo(Ctor));
    }
}
