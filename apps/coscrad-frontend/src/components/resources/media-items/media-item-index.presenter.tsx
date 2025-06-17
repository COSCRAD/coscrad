import { AggregateType, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { MediaItemIndexState } from '../../../store/slices/resources/media-items/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

export const MediaItemIndexPresenter = ({ entities: mediaItems }: MediaItemIndexState) => {
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
        title: ({ title }) => (
            <Typography component="span" variant="h6">
                {title}
            </Typography>
        ),
        // lengthMilliseconds: ({ lengthMilliseconds }) =>
        //     renderMediaLengthInSeconds(lengthMilliseconds),
    };

    return (
        <IndexTable
            type={AggregateType.mediaItem}
            headingLabels={headingLabels}
            tableData={mediaItems}
            cellRenderersDefinition={cellRenderersDefinition}
            heading={'Media'}
            filterableProperties={['title']}
        />
    );
};
