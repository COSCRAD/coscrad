import {
    BibliographicReferenceType,
    IBibliographicReferenceViewModel,
    IDetailQueryResult,
} from '@coscrad/api-interfaces';
import { GenericDetailPresenter } from '../../../utils/generic-components/presenters/generic-detail-presenter';
import { FunctionalComponent } from '../../../utils/types/functional-component';

type Presenter = FunctionalComponent<IDetailQueryResult<IBibliographicReferenceViewModel>>;

const lookupTable: { [K in BibliographicReferenceType]: Presenter } = {
    // TODO Create specific presenters for each of the following
    [BibliographicReferenceType.book]: GenericDetailPresenter,
    [BibliographicReferenceType.courtCase]: GenericDetailPresenter,
    [BibliographicReferenceType.journalArticle]: GenericDetailPresenter,
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
