import { useLoadableTags } from '../../store/slices/tagSlice/hooks/use-loadable-tags';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { TagIndexPresenter } from './tag-index.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const loadableTags = useLoadableTags();

    // wrap the presenter with handling for errors and pending state
    const LoadableTagPresenter = displayLoadableWithErrorsAndLoading(TagIndexPresenter);

    return <LoadableTagPresenter {...loadableTags} />;
};
