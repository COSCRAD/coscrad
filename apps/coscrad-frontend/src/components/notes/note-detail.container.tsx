import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchNotes } from '../../store/slices/notes/thunks';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { CategorizablesOfMultipleTypeContainer } from '../higher-order-components';
import { Loading } from '../Loading';
import { fullViewCategorizablePresenterFactory } from '../resources/factories/full-view-categorizable-presenter-factory';
import { NoteDetailFullViewPresenter } from './note-detail.full-view.presenter';

export const NoteDetailContainer = (): JSX.Element => {
    /**
     * TODO Once Notes follow the standard `IIndexQueryResult` structure, refactor
     * using the same abstractions as in resource index-to-detail flows.
     */
    const idFromLocation = useIdFromLocation();

    const dispatch = useAppDispatch();

    const { data: allNotes, isLoading, errorInfo } = useSelector((state: RootState) => state.notes);

    useEffect(() => {
        if (allNotes === null) dispatch(fetchNotes());
    }, [allNotes, dispatch]);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || allNotes === null) return <Loading />;

    const note = allNotes.find(({ id }) => id === idFromLocation);

    // Make this render a <NotFound />
    if (!note) return <div>Not Found</div>;

    return (
        <div>
            <NoteDetailFullViewPresenter {...note} />
            <CategorizablesOfMultipleTypeContainer
                detailPresenterFactory={fullViewCategorizablePresenterFactory}
                members={note.connectedResources.map(
                    ({ compositeIdentifier }) => compositeIdentifier
                )}
            />
        </div>
    );
};
