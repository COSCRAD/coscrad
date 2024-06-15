import { isNull } from '@coscrad/validation-constraints';
import { Divider } from '@mui/material';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableNoteById } from '../../store/slices/notes/hooks';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { SelectedCategorizablesOfMultipleTypesPresenter } from '../higher-order-components/selected-categorizables-of-multiple-types.presenter';
import { useLoadableCategorizables } from '../higher-order-components/use-loadable-categorizables';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { NoteDetailFullViewPresenter } from './note-detail.full-view.presenter';

export const NoteDetailPageContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableNote = useLoadableNoteById(id);

    const { data } = loadableNote;

    const compositeIdentifiers =
        data === NOT_FOUND || isNull(data)
            ? []
            : data.connectedResources.map(({ compositeIdentifier }) => compositeIdentifier);

    const loadableCategorizables = useLoadableCategorizables(compositeIdentifiers);

    const NoteDetailPresenter = displayLoadableSearchResult(NoteDetailFullViewPresenter);

    // TODO We need a better way of combining loadables
    return (
        <>
            <NoteDetailPresenter {...loadableNote} />
            <Divider sx={{ margin: '25px 0' }} />
            <h3>Connected Resources</h3>
            <SelectedCategorizablesOfMultipleTypesPresenter
                viewModelSnapshot={loadableCategorizables}
                presenterFactory={thumbnailCategorizableDetailPresenterFactory}
            />
        </>
    );
};
