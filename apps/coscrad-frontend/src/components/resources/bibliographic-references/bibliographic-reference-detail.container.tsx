import { useLoadableBibliographicReferenceById } from '../../../store/slices/resources';
import { displayLoadableSearchResult } from '../../higher-order-components/display-loadable-search-result';
import { BibliographicReferenceDetailPresenter } from './bibliographic-reference-detail.presenter';

export const BibliographicReferenceDetailContainer = (): JSX.Element => {
    const loadableSearchResult = useLoadableBibliographicReferenceById();

    const Presenter = displayLoadableSearchResult(BibliographicReferenceDetailPresenter);

    return <Presenter {...loadableSearchResult} />;
};
