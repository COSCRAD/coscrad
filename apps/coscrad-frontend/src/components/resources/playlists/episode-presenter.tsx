import { IPlaylistEpisode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { MultilingualTextPresenter } from '../../../utils/generic-components/presenters/multilingual-text-presenter';

interface EpisodePresenterProps {
    episode: IPlaylistEpisode;
}

export const EpisodePresenter = ({ episode: { name } }: EpisodePresenterProps): JSX.Element => {
    return <Typography variant={'h4'}>{<MultilingualTextPresenter text={name} />}</Typography>;
};
