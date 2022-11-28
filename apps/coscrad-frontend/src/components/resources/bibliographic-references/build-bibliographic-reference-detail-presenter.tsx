import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../utils/types/functional-component';
import { BookBibliographicReferenceDetailFullViewPresenter } from './book-bibliographic-reference-detail.full-view.presenter';
import { CourtCaseBibliographicReferenceDetailFullViewPresenter } from './court-case-bibliographic-reference-detail.full-view.presenter';
import { JournalArticleBibliographicReferenceFullViewPresenter } from './journal-article-bibliographic-reference.full-view.presenter';

type Presenter = FunctionalComponent<IDetailQueryResult<IBibliographicReferenceViewModel>>;

const lookupTable: {
    [K in BibliographicReferenceType]: FunctionalComponent<IBibliographicReferenceViewModel>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceDetailFullViewPresenter,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceDetailFullViewPresenter,
    [BibliographicReferenceType.journalArticle]:
        JournalArticleBibliographicReferenceFullViewPresenter,
};

export const buildBibliographicReferenceDetailPresenter = (
    bibliographicReferenceType: BibliographicReferenceType
): Presenter => {
    const lookupResult = lookupTable[bibliographicReferenceType];

    if (!lookupResult)
        throw new Error(
            `Failed to build a detail presenter for bibliographic reference type: ${bibliographicReferenceType}`
        );

    // Let's hide this from the nested presenter
    return ({ data }: IDetailQueryResult<IBibliographicReferenceViewModel>) => lookupResult(data);
};
