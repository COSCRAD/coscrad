import { AggregateType, CategorizableType } from '@coscrad/api-interfaces';
import { isNull } from '@coscrad/validation-constraints';
import { NOT_FOUND } from '../../store/slices/interfaces/maybe-loadable.interface';
import { useLoadableTagById } from '../../store/slices/tagSlice/hooks/use-loadable-tag-by-id';
import { useIdFromLocation } from '../../utils/custom-hooks/use-id-from-location';
import { displayLoadableSearchResult } from '../higher-order-components/display-loadable-search-result';
import { SelectedCategorizablesOfMultipleTypesPresenter } from '../higher-order-components/selected-categorizables-of-multiple-types.presenter';
import { useLoadableCategorizables } from '../higher-order-components/use-loadable-categorizables';
import { thumbnailCategorizableDetailPresenterFactory } from '../resources/factories/thumbnail-categorizable-detail-presenter-factory';
import { WithCommands } from '../resources/shared';
import { TagDetailPresenter } from './tag-detail.presenter';

export const TagDetailContainer = (): JSX.Element => {
    const id = useIdFromLocation();

    const loadableTags = useLoadableTagById(id);

    const { data } = loadableTags;

    const compositeIdentifiers = data === NOT_FOUND || isNull(data) ? [] : data.members;

    const loadableCategorizables = useLoadableCategorizables(compositeIdentifiers);

    const DetailPresenter = WithCommands(
        TagDetailPresenter,
        ({ actions }) => actions,
        ({ id }) => ({ type: AggregateType.tag, id })
    );

    const TagAndCommandsPresenter = displayLoadableSearchResult(DetailPresenter);

    return (
        <>
            <TagAndCommandsPresenter {...loadableTags}></TagAndCommandsPresenter>
            <SelectedCategorizablesOfMultipleTypesPresenter
                viewModelSnapshot={loadableCategorizables}
                presenterFactory={thumbnailCategorizableDetailPresenterFactory}
                getPluralLabelForCategorizableType={(categorizableType: CategorizableType) =>
                    `${categorizableType}s`
                }
            />
        </>
    );
};
