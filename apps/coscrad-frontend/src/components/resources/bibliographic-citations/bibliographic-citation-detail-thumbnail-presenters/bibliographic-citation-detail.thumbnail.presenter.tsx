import {
    IBibliographicCitationViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { buildBibliographicCitationDetailThumbnailPresenter } from './build-bibliographic-citation-detail-thumbnail-presenter';

export const BibliographicCitationDetailThumbnailPresenter = (
    detailQueryResult: ICategorizableDetailQueryResult<IBibliographicCitationViewModel>
): JSX.Element => {
    const {
        data: { type: bibliographicCitationType },
    } = detailQueryResult;

    // This is the same logic as the full-view with a different factory here
    const Presenter = buildBibliographicCitationDetailThumbnailPresenter(
        bibliographicCitationType
    );

    return <Presenter {...detailQueryResult} />;
};
