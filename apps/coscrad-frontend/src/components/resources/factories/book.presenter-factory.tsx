import {
    IBookViewModel,
    ICategorizableDetailQueryResult,
    ICategorizableIndexQueryResult,
} from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { AutoStories as AutoStoriesIcon } from '@mui/icons-material';
import { Box } from '@mui/material';
import { ResourcePreviewImageProps } from '../../../utils/generic-components';
import {
    BookDetailFullViewPresenter,
    BookDetailThumbnailPresenter,
    BookIndexPresenter,
} from '../books';
import { ResourcePresenterFactory } from './presenter-factory';

const sizesInPixels = {
    xs: '20px',
    sm: '40px',
    md: '60px',
    lg: '100px',
    xl: '200px',
};

export const bookPresenterFactory: ResourcePresenterFactory<IBookViewModel> = {
    buildFullView: (queryResult: ICategorizableDetailQueryResult<IBookViewModel>) => (
        <BookDetailFullViewPresenter {...queryResult} />
    ),

    buildThumbnailView: (queryResult: ICategorizableDetailQueryResult<IBookViewModel>) => (
        <BookDetailThumbnailPresenter {...queryResult} />
    ),

    buildIndexTable: (queryResult: ICategorizableIndexQueryResult<IBookViewModel>) => (
        <BookIndexPresenter {...queryResult} />
    ),

    buildDescription: ({ title, subtitle }: IBookViewModel): string =>
        title.concat(isNullOrUndefined(subtitle) ? '' : ` (${subtitle})`),

    buildIcon: ({
        size = 'md',
        color,
        // TODO Use this
        fontSize: _fontSize,
    }: ResourcePreviewImageProps) => {
        const sizeInPixels = sizesInPixels[size];

        return (
            <Box sx={{ fontSize: sizeInPixels, maxHeight: sizeInPixels, color: color }}>
                <AutoStoriesIcon fontSize="inherit" />
            </Box>
        );
    },
};
