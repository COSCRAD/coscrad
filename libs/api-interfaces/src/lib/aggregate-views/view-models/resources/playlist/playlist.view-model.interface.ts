import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common';
import { IPlaylistEpisode } from './playlist-episode.interface';

export interface IPlayListViewModel extends IBaseResourceViewModel {
    name: IMultilingualText;

    // TODO establish a view model for episodes
    episodes: IPlaylistEpisode[];
}
