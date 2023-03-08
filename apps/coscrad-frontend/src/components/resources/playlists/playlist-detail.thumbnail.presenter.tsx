import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';

export const PlaylistDetailThumbnailPresenter = (
    _: ICategorizableDetailQueryResult<IPlayListViewModel>
): JSX.Element => {
    return <div>playlist</div>;
};
