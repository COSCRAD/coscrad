import { BibliographicReferenceType } from '@coscrad/api-interfaces';
import { useLoadableBibliographicReferences } from '../../../store/slices/resources';
import { FilteredAggregateIndexContainer } from '../../higher-order-components';
import { BibliographicReferenceIndexPresenter } from './bibliographic-reference-index.presenter';

export const BibliographicReferenceIndexContainer = (): JSX.Element => (
    <FilteredAggregateIndexContainer
        useLoadableModels={useLoadableBibliographicReferences}
        IndexPresenter={BibliographicReferenceIndexPresenter}
        /**
         * TODO disable this filter until we get a chance to inject it
         * based on a config. For now, it helps me demo this functionality.
         */
        filter={({ data: { type: bibliographicReferenceType } }) =>
            bibliographicReferenceType === BibliographicReferenceType.courtCase
        }
    />
);
