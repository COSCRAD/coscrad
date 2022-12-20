import {
    IBibliographicReferenceViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { buildBibliographicReferenceDetailPresenter } from './build-bibliographic-reference-detail-presenter';

export const BibliographicReferenceDetailPresenter = (
    detailQueryResult: ICategorizableDetailQueryResult<IBibliographicReferenceViewModel>
): JSX.Element => {
    const {
        data: { type: bibliographicReferenceType },
    } = detailQueryResult;

    const Presenter = buildBibliographicReferenceDetailPresenter(bibliographicReferenceType);

    return <Presenter {...detailQueryResult} />;
};
