import { ITagViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../resources/utils/render-aggregate-id-cell';

type HasViewModels<TViewModel> = {
    data: TViewModel[];
};

/**
 * TODO[https://www.pivotaltracker.com/story/show/183618856]
 * We need to expose Tag commands through Tag queries.
 */
export const TagIndexPresenter = ({ data: tags }: HasViewModels<ITagViewModel>): JSX.Element => {
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
            tableData={tags}
            headingLabels={headingLabels}
            cellRenderersDefinition={cellRenderersDefinition}
            heading="Tags"
            filterableProperties={['label']}
        />
    );
};
