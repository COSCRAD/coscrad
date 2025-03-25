import { AggregateType, IPhotographViewModel } from '@coscrad/api-interfaces';
import { useContext } from 'react';
import { ConfigurableContentContext } from '../../../configurable-front-matter/configurable-content-provider';
import { PhotographIndexState } from '../../../store/slices/resources/photographs/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { renderMultilingualTextCell } from '../utils/render-multilingual-text-cell';
import { renderPhotographThumbnailLinkCell } from '../utils/render-photograph-thumbnail-link-cell';

export const PhotographIndexPresenter = ({ entities: photographs }: PhotographIndexState) => {
    const { defaultLanguageCode } = useContext(ConfigurableContentContext);

    const headingLabels: HeadingLabel<IPhotographViewModel>[] = [
        { propertyKey: 'id', headingLabel: 'Link' },
        { propertyKey: 'imageUrl', headingLabel: 'Image' },
        { propertyKey: 'name', headingLabel: 'Title' },
        { propertyKey: 'photographer', headingLabel: 'Photographer' },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IPhotographViewModel> = {
        id: renderAggregateIdCell,
        imageUrl: ({ id, imageUrl }: IPhotographViewModel) =>
            renderPhotographThumbnailLinkCell(id, imageUrl),
        name: ({ name }: IPhotographViewModel) =>
            renderMultilingualTextCell(name, defaultLanguageCode),
    };

    return (
        <IndexTable
            type={AggregateType.photograph}
            headingLabels={headingLabels}
            tableData={photographs}
            cellRenderersDefinition={cellRenderersDefinition}
            // This should be a resource label from resource info
            heading={'Photographs'}
            filterableProperties={['photographer']}
        />
    );
};
