import { IBibliographicReferenceViewModel, ICommandFormAndLabels } from '@coscrad/api-interfaces';
import { BibliographicReferenceViewModel } from '../../../view-models/buildViewModelForResource/viewModels/bibliographic-reference/bibliographic-reference.view-model';
import { IBibliographicReferenceData } from '../../models/bibliographic-reference/interfaces/bibliographic-reference-data.interface';
import { IBibliographicReference } from '../../models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { ResourceType } from '../../types/ResourceType';
import { BaseQueryService } from './base-query.service';

export class BibliographicReferenceQueryService extends BaseQueryService<
    IBibliographicReference,
    IBibliographicReferenceViewModel
> {
    protected readonly type = ResourceType.bibliographicReference;

    buildViewModel(
        bibliographicReferenceInstance: IBibliographicReference<IBibliographicReferenceData>
    ): IBibliographicReferenceViewModel {
        return new BibliographicReferenceViewModel(bibliographicReferenceInstance);
    }

    getInfoForIndexScopedCommands(): ICommandFormAndLabels[] {
        return [];
        // TODO Get available index scoped commands from Ctors
        // return [BookBibliographicReference, JournalArticleBibliographicReference].flatMap((Ctor) =>
        //     this.commandInfoService.getCommandInfo(Ctor)
        // );
    }
}
