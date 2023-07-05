import {
    ICategorizableDetailQueryResult,
    IPlayListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ResourceDetailThumbnailPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { ContextProps } from '../factories/full-view-categorizable-presenter-factory';

export const PlaylistDetailThumbnailPresenter = ({
    name,
    episodes,
    id,
}: ICategorizableDetailQueryResult<IPlayListViewModel> & ContextProps): JSX.Element => (
    <ResourceDetailThumbnailPresenter name={name} id={id} type={ResourceType.playlist}>
        <Typography component={'div'}>
            <Typography variant={'h5'}> Number of Episodes </Typography>
            {episodes.length}
        </Typography>
    </ResourceDetailThumbnailPresenter>
);
