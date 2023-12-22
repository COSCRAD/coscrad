import {
    IBibliographicCitationViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { buildBibliographicCitationDetailPresenter } from './build-bibliographic-citation-detail-presenter';

export const BibliographicCitationDetailPresenter = (
    detailQueryResult: ICategorizableDetailQueryResult<IBibliographicCitationViewModel>
): JSX.Element => {
    const {
        data: { type: bibliographicCitationType },
    } = detailQueryResult;

    const Presenter = buildBibliographicCitationDetailPresenter(bibliographicCitationType);

    return <Presenter {...detailQueryResult} />;
};
