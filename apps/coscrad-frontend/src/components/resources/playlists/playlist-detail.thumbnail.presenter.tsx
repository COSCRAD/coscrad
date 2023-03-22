import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';

export const PlaylistDetailThumbnailPresenter = ({
    name,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => (
    <ResourceDetailThumbnailPresenter name={name}>
        <Typography component={'div'}>
            <Typography variant={'h5'}> Number of Episodes </Typography>
            {episodes.length}
        </Typography>
    </ResourceDetailThumbnailPresenter>
);
