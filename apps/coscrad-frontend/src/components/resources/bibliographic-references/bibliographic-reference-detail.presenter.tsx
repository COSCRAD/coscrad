import {
    IBibliographicReferenceViewModel,
    ICategorizableDetailQueryResult,
} from '@coscrad/api-interfaces';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';
import { buildBibliographicReferenceDetailPresenter } from './build-bibliographic-reference-detail-presenter';

export const BibliographicReferenceDetailPresenter = (
    detailQueryResult: ICategorizableDetailQueryResult<IBibliographicReferenceViewModel> &
        ContextProps
): JSX.Element => {
    const {
        data: { type: bibliographicReferenceType },
    } = detailQueryResult;

    const Presenter = buildBibliographicReferenceDetailPresenter(bibliographicReferenceType);

    return <Presenter {...detailQueryResult} />;
};
