import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useAppDispatch } from '../../../../app/hooks';
import { selectLoadableNotes } from '../selectors';
import { fetchNotes } from '../thunks';

/**
 * TODO [https://www.pivotaltracker.com/story/show/183681556]
 * Remove this **HACK** once the tech-debt story is completed.
 */
export const useLoadableNotesWithStandardFormat = () => {
    const loadable = useSelector(selectLoadableNotes);

    const { data: notes } = loadable;

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (notes === null) dispatch(fetchNotes());
    }, [notes, dispatch]);

    if (notes === null)
        return {
            data: null,
            errorInfo: loadable.errorInfo,
            isLoading: true,
        };

    return {
        ...loadable,
        data: notes && {
            actions: [],
            data: notes.map((note) => ({
                data: note,
                actions: [],
            })),
        },
    };
};
