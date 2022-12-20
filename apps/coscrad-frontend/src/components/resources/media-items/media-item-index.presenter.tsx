import { IIndexQueryResult, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';
import { formatBilingualText } from '../vocabulary-lists/utils/formatBilingualText';

export const MediaItemIndexPresenter = ({
    entities: mediaItems,
}: IIndexQueryResult<IMediaItemViewModel>) => {
    const headingLabels: HeadingLabel<IMediaItemViewModel>[] = [
        {
            propertyKey: 'id',
            headingLabel: 'Link',
        },
        {
            propertyKey: 'title',
            headingLabel: 'Title',
        },
        // {
        //     propertyKey: 'lengthMilliseconds',
        //     headingLabel: 'Length',
        // },
    ];

    const cellRenderersDefinition: CellRenderersDefinition<IMediaItemViewModel> = {
        id: renderAggregateIdCell,
        title: ({ title, titleEnglish }) => formatBilingualText(title, titleEnglish),
        // lengthMilliseconds: ({ lengthMilliseconds }) =>
        //     renderMediaLengthInSeconds(lengthMilliseconds),
    };

    return (
        <IndexTable
            headingLabels={headingLabels}
            tableData={mediaItems}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Media'}
            filterableProperties={['title', 'titleEnglish']}
        />
    );
};
