import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IDetailQueryResult,
} from '@coscrad/api-interfaces';
import { FunctionalComponent } from '../../../../utils/types/functional-component';
import { BookBibliographicReferenceDetailThumbnailPresenter } from './book-bibliographic-reference-detail.thumbnail.presenter';
import { CourtCaseBibliographicReferenceDetailThumbnailPresenter } from './court-case-bibliographic-reference-detail.thumbnail.presenter';
import { JournalArticleBibliographicReferenceThumbnailPresenter } from './journal-article-bibliographic-reference-detail.thumbnail.presenter';

type Presenter = FunctionalComponent<IDetailQueryResult<IBibliographicReferenceViewModel>>;

const lookupTable: {
    [K in BibliographicReferenceType]: FunctionalComponent<IBibliographicReferenceViewModel>;
} = {
    [BibliographicReferenceType.book]: BookBibliographicReferenceDetailThumbnailPresenter,
    [BibliographicReferenceType.courtCase]: CourtCaseBibliographicReferenceDetailThumbnailPresenter,
    [BibliographicReferenceType.journalArticle]:
        JournalArticleBibliographicReferenceThumbnailPresenter,
};

export const buildBibliographicReferenceDetailThumbnailPresenter = (
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
