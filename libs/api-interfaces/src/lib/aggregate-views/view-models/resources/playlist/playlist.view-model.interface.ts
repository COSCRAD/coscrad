import { IMultilingualTextRecord } from '..';
import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IPlaylistEpisode } from './playlist-episode.interface';

export interface IPlayListViewModel extends IBaseResourceViewModel {
    name: IMultilingualTextRecord;

    // TODO establish a view model for episodes
    episodes: IPlaylistEpisode[];
}
