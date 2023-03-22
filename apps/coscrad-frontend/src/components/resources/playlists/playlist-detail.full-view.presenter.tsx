import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { EpisodePresenter } from './episode-presenter';
export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id}>
        <Typography component={'div'}>
            <Typography variant={'h5'}> Episodes </Typography>
            {episodes.map((episode) => (
                <EpisodePresenter episode={episode} />
            ))}
        </Typography>
    </ResourceDetailFullViewPresenter>
);
