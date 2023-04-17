import {
    ICategorizableDetailQueryResult,
    IPlayListViewModel,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { AudioPanel } from '../../audio-panel/audio-panel';
import { EpisodePresenter } from './episode-presenter';

export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id} type={ResourceType.playlist}>
        <Typography component={'div'}>
            <Typography variant={'h5'}> Episodes </Typography>
            {episodes.map((episode) => (
                <EpisodePresenter episode={episode} />
            ))}
            <AudioPanel url={''} />
        </Typography>
    </ResourceDetailFullViewPresenter>
);
