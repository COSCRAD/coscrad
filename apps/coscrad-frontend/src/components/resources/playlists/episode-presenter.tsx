import { IPlaylistEpisode } from '@coscrad/api-interfaces';
import { Typography } from '@mui/material';
import { ExpandableMultilingualTextPresenter } from '../../../utils/generic-components/presenters/expandable-multilingual-text-presenter';

interface EpisodePresenterProps {
    episode: IPlaylistEpisode;
}

export const EpisodePresenter = ({ episode: { name } }: EpisodePresenterProps): JSX.Element => {
    return (
        <Typography variant={'h4'}>
            {<ExpandableMultilingualTextPresenter text={name} />}
        </Typography>
    );
};
