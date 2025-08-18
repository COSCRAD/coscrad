import { useAuth0 } from '@auth0/auth0-react';
import { AggregateType, IMediaItemViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { MediaItemIndexState } from '../../../store/slices/resources/media-items/types';
import { HeadingLabel, IndexTable } from '../../../utils/generic-components/presenters/tables';
import { CellRenderersDefinition } from '../../../utils/generic-components/presenters/tables/generic-index-table-presenter/types/cell-renderers-definition';
import { FileUploadForm } from '../../file-upload/file-upload';
import { renderAggregateIdCell } from '../utils/render-aggregate-id-cell';

export const MediaItemIndexPresenter = ({ entities: mediaItems }: MediaItemIndexState) => {
    const { isAuthenticated } = useAuth0();

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
        <>
            <IndexTable
                type={AggregateType.mediaItem}
                headingLabels={headingLabels}
                tableData={mediaItems}
                cellRenderersDefinition={cellRenderersDefinition}
                heading={'Media'}
                filterableProperties={['title']}
            />
            {isAuthenticated ? <FileUploadForm /> : null}
        </>
    );
};
