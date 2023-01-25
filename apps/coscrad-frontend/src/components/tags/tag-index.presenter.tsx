import { ITagViewModel } from '@coscrad/api-interfaces';
import { TagIndexState } from '../../store/slices/tagSlice/types/tag-index-state';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../resources/utils/render-aggregate-id-cell';

export const TagIndexPresenter = ({ entities: tags }: TagIndexState): JSX.Element => {
    const headingLabels: HeadingLabel<ITagViewModel>[] = [
        {
            propertyKey: 'id',
            headingLabel: 'Link',
        },
        {
            propertyKey: 'label',
            headingLabel: 'Label',
        },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<ITagViewModel> = {
        id: renderAggregateIdCell,
    };

    return (
        <IndexTable
            data-testid="tag-index-presenter"
            tableData={tags}
            headingLabels={headingLabels}
            cellRenderersDefinition={cellRenderersDefinition}
            heading="Tags"
            filterableProperties={['label']}
        />
    );
};
