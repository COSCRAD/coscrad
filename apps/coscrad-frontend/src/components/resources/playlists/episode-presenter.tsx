import { IPlaylistEpisode } from '@coscrad/api-interfaces';

interface EpisodePresenterProps {
    episode: IPlaylistEpisode;
}

export const EpisodePresenter = ({ episode }: EpisodePresenterProps): JSX.Element => {
    return <div>{JSON.stringify(episode)}</div>;
};
