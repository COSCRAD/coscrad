import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { EpisodePresenter } from './episode-presenter';

export const PlaylistDetailThumbnailPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id}>
        <div>
            <h3> Episodes </h3>
            {episodes.length}
            {episodes.map((episode) => (
                <EpisodePresenter name={name} episode={episode} />
            ))}
        </div>
    </ResourceDetailFullViewPresenter>
);
