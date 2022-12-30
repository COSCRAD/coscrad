import { AggregateType } from '@coscrad/api-interfaces';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableNoteById } from '../../store/slices/notes/hooks';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { CommandPanel } from '../commands';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { fullViewCategorizablePresenterFactory } from '../resources/factories/full-view-categorizable-presenter-factory';
import { NoteDetailFullViewPresenter } from './note-detail.full-view.presenter';

export const NoteDetailContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableNote = useLoadableNoteById(id);

    const Presenter = displayLoadableSearchResult(NoteDetailFullViewPresenter);

    // TODO We need a better way of chaining loadables
    return (
        <>
            <Presenter {...loadableNote} />
            {loadableNote.data && loadableNote.data !== NOT_FOUND && (
                <>
                    <CategorizablesOfMultipleTypeContainer
                        detailPresenterFactory={fullViewCategorizablePresenterFactory}
                        members={loadableNote.data.connectedResources.map(
                            ({ compositeIdentifier }) => compositeIdentifier
                        )}
                        heading={`${
                            loadableNote.data.connectedResources.length > 1
                                ? 'Connects the following resources'
                                : 'About the following resource'
                        }`}
                    />
                    <CommandPanel
                        actions={loadableNote.data.actions}
                        commandContext={{
                            id: loadableNote.data.id,
                            type: AggregateType.note,
                        }}
                    />
                </>
            )}
        </>
    );
};
