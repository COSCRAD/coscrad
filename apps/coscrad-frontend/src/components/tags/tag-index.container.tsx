import { useLoadableTags } from '../../store/slices/tagSlice/hooks/use-loadable-tags';
import { wrapArrayProps } from '../../utils/prop-manipulation/wrap-array-props';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { TagIndexPresenter } from './tag-index.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const [loadableTags] = useLoadableTags();

    // wrap the presenter with handling for errors and pending state
    const LoadableTagPresenter = displayLoadableWithErrorsAndLoading(
        TagIndexPresenter,
        // wrap the loaded array in a nested prop
        wrapArrayProps
    );

    return <LoadableTagPresenter {...loadableTags} />;
};
