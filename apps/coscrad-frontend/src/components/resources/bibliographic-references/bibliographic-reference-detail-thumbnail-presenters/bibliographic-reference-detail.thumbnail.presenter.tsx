import { IBibliographicReferenceViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { buildBibliographicReferenceDetailThumbnailPresenter } from './build-bibliographic-reference-detail-thumbnail-presenter';

export const BibliographicReferenceDetailThumbnailPresenter = (
    detailQueryResult: IDetailQueryResult<IBibliographicReferenceViewModel>
): JSX.Element => {
    const {
        data: {
            data: { type: bibliographicReferenceType },
        },
    } = detailQueryResult;

    // This is the same logic as the full-view with a different factory here
    const Presenter = buildBibliographicReferenceDetailThumbnailPresenter(
        bibliographicReferenceType
    );

    return <Presenter {...detailQueryResult} />;
};
