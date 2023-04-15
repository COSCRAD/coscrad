import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BookBibliographicReferenceDetailFullViewPresenter } from './book-bibliographic-reference-detail.full-view.presenter';
import { CourtCaseBibliographicReferenceDetailFullViewPresenter } from './court-case-bibliographic-reference-detail.full-view.presenter';
import { JournalArticleBibliographicReferenceDetailFullViewPresenter } from './journal-article-bibliographic-reference-detail.full-view.presenter';

type Presenter = FunctionalComponent<
    ICategorizableDetailQueryResult<IBibliographicReferenceViewModel>
>;

const lookupTable: {
    [K in BibliographicReferenceType]: FunctionalComponent<IBibliographicReferenceViewModel>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceDetailFullViewPresenter,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceDetailFullViewPresenter,
    [BibliographicReferenceType.journalArticle]:
        JournalArticleBibliographicReferenceDetailFullViewPresenter,
};

export const buildBibliographicReferenceDetailPresenter = (
    bibliographicReferenceType: BibliographicReferenceType
): Presenter => {
    const lookupResult = lookupTable[bibliographicReferenceType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for bibliographic reference type: ${bibliographicReferenceType}`
        );

    return lookupResult;
};
