import { IPhotographViewModel } from '@coscrad/api-interfaces';
import { PhotographIndexState } from '../../../store/slices/resources/photographs/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { CoscradMainContentContainer } from '../../../utils/generic-components/style-components/coscrad-main-content-container';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderPhotographThumbnailLinkCell } from '../utils/render-photograph-thumbnail-link-cell';

export const PhotographIndexPresenter = ({ entities: photographs }: PhotographIndexState) => {
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
        <CoscradMainContentContainer>
            <IndexTable
                headingLabels={headingLabels}
                tableData={photographs}
                cellRenderersDefinition={cellRenderersDefinition}
                // This should be a resource label from resource info
                heading={'Photographs'}
                filterableProperties={['photographer']}
            />
        </CoscradMainContentContainer>
    );
};
