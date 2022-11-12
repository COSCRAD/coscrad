import { RootState } from '../../..';
import { useLoadable } from '../../resources/shared/hooks';
import { TAGS } from '../constants';
import { fetchTags } from '../thunks';

export const useLoadableTags = () =>
    useLoadable({
        selector: (state: RootState) => state[TAGS],
        fetchThunk: fetchTags,
    });
