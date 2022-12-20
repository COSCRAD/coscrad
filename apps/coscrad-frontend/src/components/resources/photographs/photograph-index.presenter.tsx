import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderPhotographThumbnailLinkCell } from '../utils/render-photograph-thumbnail-link-cell';

export const PhotographIndexPresenter = ({
    entities: photographs,
}: IIndexQueryResult<IPhotographViewModel>) => {
    const headingLabels: HeadingLabel<IPhotographViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'imageURL', headingLabel: 'Image URL' },
        { propertyKey: 'photographer', headingLabel: 'Photographer' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPhotographViewModel> = {
        id: renderAggregateIdCell,
        imageURL: ({ id, imageURL }: IPhotographViewModel) =>
            renderPhotographThumbnailLinkCell(id, imageURL),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={photographs}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Photographs'}
            filterableProperties={['photographer']}
        />
    );
};
