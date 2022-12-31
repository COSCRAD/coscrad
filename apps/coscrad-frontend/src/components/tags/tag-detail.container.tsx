import { AggregateType } from '@coscrad/api-interfaces';
import { useLoadableTagById } from '../../store/slices/tagSlice/hooks/use-loadable-tag-by-id';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { WithCommands } from '../resources/shared';
import { TagDetailPresenter } from './tag-detail.presenter';

export const TagDetailContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableTags = useLoadableTagById(id);

    const DetailPresenter = WithCommands(
        TagDetailPresenter,
        ({ actions }) => actions,
        ({ id }) => ({ type: AggregateType.tag, id })
    );

    const Presenter = displayLoadableSearchResult(DetailPresenter);

    return <Presenter {...loadableTags}></Presenter>;
};
