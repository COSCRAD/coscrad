import { useLoadableNoteById } from '../../store/slices/notes/hooks';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { NoteDetailFullViewPresenter } from './note-detail.full-view.presenter';

export const NoteDetailContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableNote = useLoadableNoteById(id);

    const Presenter = displayLoadableSearchResult(NoteDetailFullViewPresenter);

    const AssociatedResourcesPanel = displayLoadableSearchResult(
        CategorizablesOfMultipleTypeContainer,
        ({ connectedResources }) =>
            connectedResources.map(({ compositeIdentifier }) => ({
                compositeIdentifier,
                heading:
                    connectedResources.length > 1
                        ? 'Connects the following resources'
                        : 'About the following resource',
            }))
    );

    return (
        <div>
            <Presenter {...loadableNote} />

            <AssociatedResourcesPanel {...loadableNote} />
        </div>
    );
};
