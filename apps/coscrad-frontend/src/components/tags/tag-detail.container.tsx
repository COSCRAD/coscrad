import { useLoadableTagById } from '../../store/slices/tagSlice/hooks/use-loadable-tag-by-id';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { TagDetailPresenter } from './tag-detail.presenter';

export const TagDetailContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableTags = useLoadableTagById(id);

    const Presenter = displayLoadableSearchResult(TagDetailPresenter);

    return <Presenter {...loadableTags}></Presenter>;
};
