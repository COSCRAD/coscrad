import { useLoadableBibliographicReferences } from '../../../store/slices/resources';
import { displayLoadableWithErrorsAndLoading } from '../../higher-order-components';
import { BibliographicReferenceIndexPresenter } from './bibliographic-reference-index.presenter';

export const BibliographicReferenceIndexContainer = (): JSX.Element => {
    const [loadableBibliographicReferences] = useLoadableBibliographicReferences();

    const Presenter = displayLoadableWithErrorsAndLoading(BibliographicReferenceIndexPresenter);

    return <Presenter {...loadableBibliographicReferences} />;
};
