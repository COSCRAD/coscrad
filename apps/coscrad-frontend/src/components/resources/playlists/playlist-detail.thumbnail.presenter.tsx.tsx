import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';

export const PlaylistDetailThumbnailPresenter =
    // eslint-disable-next-line no-empty-pattern
    ({}: ICategorizableDetailQueryResult<IPlayListViewModel>): JSX.Element => {
        return <div>playlist</div>;
    };
