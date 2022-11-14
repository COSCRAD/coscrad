import { IIndexQueryResult, IPhotographViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMediaLinkCell } from '../utils/render-media-link-cell';

export const PhotographIndexPresenter = (indexResult: IIndexQueryResult<IPhotographViewModel>) => {
    /**
     *  TODO [https://www.pivotaltracker.com/story/show/183681839]
     * We may some day read the actions and allow for bulk command execution in
     * an index view.
     */
    const { data: detailResult } = indexResult;

    const photographs = detailResult.map(({ data }) => data);

    const headingLabels: HeadingLabel<IPhotographViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'imageURL', headingLabel: 'Image URL' },
        { propertyKey: 'photographer', headingLabel: 'Photographer' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPhotographViewModel> = {
        id: renderAggregateIdCell,
        imageURL: ({ imageURL }: IPhotographViewModel) => renderMediaLinkCell(imageURL),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={photographs}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource lable from resource info
            heading={'Photographs'}
        />
    );
};
