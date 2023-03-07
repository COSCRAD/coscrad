import { IBaseViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../audio-item';

export interface IPlayListViewModel extends IBaseViewModel {
    name: IMultilingualText;

    // TODO establish a view model for episodes
    episodes: string[];
}
