import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchNotes } from '../../store/slices/noteSlice/thunks';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { NoteDetailPresenter } from './NoteDetail.presenter';

export const NoteDetailContainer = (): JSX.Element => {
    const { id: idFromLocation } = useParams();

    const dispatch = useAppDispatch();

    const { data: allNotes, isLoading, errorInfo } = useSelector((state: RootState) => state.notes);

    useEffect(() => {
        if (allNotes === null) dispatch(fetchNotes());
    }, [allNotes, dispatch]);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading) return <Loading />;

    if (allNotes === null) {
        dispatch(fetchNotes());

        return <Loading />;
    }

    const note = allNotes.find(({ id }) => id === idFromLocation);

    if (!note) return <div>Not Found</div>;

    return <NoteDetailPresenter {...note} />;
};
