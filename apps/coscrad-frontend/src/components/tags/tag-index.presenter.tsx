import { ITagViewModel } from '@coscrad/api-interfaces';
import { TagIndexState } from '../../store/slices/tagSlice/types/tag-index-state';
import { HeadingLabel, IndexTable } from '../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { CoscradMainContentContainer } from '../../utils/generic-components/style-components/coscrad-main-content-container';
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
        <CoscradMainContentContainer>
            <IndexTable
                data-testid="tag-index-presenter"
                tableData={tags}
                headingLabels={headingLabels}
                cellRenderersDefinition={cellRenderersDefinition}
                heading="Tags"
                filterableProperties={['label']}
            />
        </CoscradMainContentContainer>
    );
};
