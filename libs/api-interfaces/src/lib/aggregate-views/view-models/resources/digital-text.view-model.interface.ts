import { IBaseViewModel } from '../base.view-model.interface';
import { IMultilingualText } from './audio-item';

export interface IDigitalTextViewModel extends IBaseViewModel {
    title: IMultilingualText;
}
