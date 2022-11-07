import { IBibliographicReferenceViewModel, IDetailQueryResult } from '@coscrad/api-interfaces';
import { buildBibliographicReferenceDetailPresenter } from './build-bibliographic-reference-detail-presenter';

export const BibliographicReferenceDetailPresenter = (
    detailQueryResult: IDetailQueryResult<IBibliographicReferenceViewModel>
): JSX.Element => {
    const {
        data: {
            data: { type: bibliographicReferenceType },
        },
    } = detailQueryResult;

    const Presenter = buildBibliographicReferenceDetailPresenter(bibliographicReferenceType);

    return <Presenter {...detailQueryResult} />;
};
