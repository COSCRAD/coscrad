import { IMultilingualText, IPlaylistEpisode } from '@coscrad/api-interfaces';
import { Card } from '@mui/material';

interface EpisodePresenterProps {
    episode: IPlaylistEpisode;
    name: IMultilingualText;
}

export const EpisodePresenter = ({ episode }: EpisodePresenterProps): JSX.Element => {
    return <Card>{episode.name}</Card>;
};
