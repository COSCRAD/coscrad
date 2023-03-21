import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';
import { ResourceDetailFullViewPresenter } from '../../../utils/generic-components/presenters/detail-views';
import { EpisodePresenter } from './episode-presenter';
export const PlaylistDetailFullViewPresenter = ({
    name,
    id,
    episodes,
}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => (
    <ResourceDetailFullViewPresenter name={name} id={id}>
        <div>
            <h3> Episodes </h3>
            {episodes.map((episode) => (
                <EpisodePresenter episode={episode} name={name} />
            ))}
        </div>
    </ResourceDetailFullViewPresenter>
);
