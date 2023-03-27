import { IPlaylistEpisode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';

interface EpisodePresenterProps {
    episode: IPlaylistEpisode;
}

export const EpisodePresenter = ({ episode }: EpisodePresenterProps): JSX.Element => {
    return <Typography variant={'h4'}>{episode.name}</Typography>;
};
