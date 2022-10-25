import { RootState } from '../../store';
import { fetchTags } from '../../store/slices/tagSlice/thunks';
import { useLoadable } from '../../utils/custom-hooks/useLoadable';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { TagIndexPresenter } from './TagIndex.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const [loadableTags] = useLoadable({
        selector: (state: RootState) => state.tags,
        fetchThunk: fetchTags,
    });

    // wrap the presenter with handling for errors and pending state
    const LoadableTagPresenter = displayLoadableWithErrorsAndLoading(
        TagIndexPresenter,
        // wrap the loaded array in a nested prop
        wrapArrayProps
    );

    return <LoadableTagPresenter {...loadableTags} />;
};
