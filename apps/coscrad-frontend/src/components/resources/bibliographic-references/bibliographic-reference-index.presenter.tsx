import { BibliographicReferenceIndexState } from '../../../store/slices/resources';
import { GenericIndexPresenter } from '../../../utils/generic-components/presenters/generic-index-presenter';

export const BibliographicReferenceIndexPresenter = (
    indexResult: BibliographicReferenceIndexState
) => (
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    <GenericIndexPresenter {...indexResult} indexLabel={'Bibliographic References'} />
);
