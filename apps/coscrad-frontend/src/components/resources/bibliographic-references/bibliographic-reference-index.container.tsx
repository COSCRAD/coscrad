import { useLoadableBibliographicReferences } from '../../../store/slices/resources';
import { AggregateIndexContainer } from '../../higher-order-components/aggregate-index-container';
import { BibliographicReferenceIndexPresenter } from './bibliographic-reference-index.presenter';

export const BibliographicReferenceIndexContainer = (): JSX.Element => (
    <AggregateIndexContainer
        useLoadableModels={useLoadableBibliographicReferences}
        IndexPresenter={BibliographicReferenceIndexPresenter}
    />
);
