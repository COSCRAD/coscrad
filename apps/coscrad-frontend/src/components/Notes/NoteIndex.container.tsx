import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../app/hooks';
import { RootState } from '../../store';
import { fetchNotes } from '../../store/slices/noteSlice/thunks';
import { ErrorDisplay } from '../ErrorDisplay/ErrorDisplay';
import { Loading } from '../Loading';
import { NoteIndexPresenter } from './NoteIndex.presenter';

export const NoteIndexContainer = (): JSX.Element => {
    const { data: notes, isLoading, errorInfo } = useSelector((state: RootState) => state.notes);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (notes === null) dispatch(fetchNotes());
    }, [notes, dispatch]);

    if (errorInfo) return <ErrorDisplay {...errorInfo} />;

    if (isLoading || notes === null) return <Loading></Loading>;

    return <NoteIndexPresenter notes={notes} />;
};
