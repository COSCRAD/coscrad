import { AggregateType } from '@coscrad/api-interfaces';
import { useLoadableTags } from '../../store/slices/tagSlice/hooks/use-loadable-tags';
import { TagIndexState } from '../../store/slices/tagSlice/types/tag-index-state';
import { displayLoadableWithErrorsAndLoading } from '../higher-order-components';
import { WithCommands } from '../resources/shared';
import { TagIndexPresenter } from './tag-index.presenter';

export const TagIndexContainer = (): JSX.Element => {
    const loadableTags = useLoadableTags();

    const IndexPresenter = WithCommands(
        TagIndexPresenter,
        ({ indexScopedActions }: TagIndexState) => indexScopedActions,
        (_) => AggregateType.tag
    );

    // wrap the presenter with handling for errors and pending state
    const LoadableTagPresenter = displayLoadableWithErrorsAndLoading(IndexPresenter);

    return <LoadableTagPresenter {...loadableTags} />;
};
