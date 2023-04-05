import { IBaseViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../audio-item';
import { IPlaylistEpisode } from './playlist-episode.interface';

export interface IPlayListViewModel extends IBaseViewModel {
    name: IMultilingualText;

    url?: string;

    // TODO establish a view model for episodes
    episodes: IPlaylistEpisode[];
}
