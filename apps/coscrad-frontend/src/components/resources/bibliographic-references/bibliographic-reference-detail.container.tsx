import { useLoadableBibliographicReferenceById } from '../../../store/slices/resources';
import { AggregateDetailContainer } from '../../higher-order-components/aggregate-detail-container';
import { BibliographicReferenceDetailPresenter } from './bibliographic-reference-detail.presenter';

export const BibliographicReferenceDetailContainer = (): JSX.Element => (
    <AggregateDetailContainer
        useLoadableSearchResult={useLoadableBibliographicReferenceById}
        DetailPresenter={BibliographicReferenceDetailPresenter}
    />
);
