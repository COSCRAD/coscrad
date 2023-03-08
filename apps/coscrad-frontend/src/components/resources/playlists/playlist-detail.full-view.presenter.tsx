import { ICategorizableDetailQueryResult, IPlayListViewModel } from '@coscrad/api-interfaces';
export const PlaylistDetailFullViewPresenter = (
    _: ICategorizableDetailQueryResult<IPlayListViewModel>
): JSX.Element => {
    return <div>playlist</div>;
};
