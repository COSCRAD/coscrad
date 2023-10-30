import { IBaseViewModel } from '../base.view-model.interface';
import { ITagViewModel } from '../tag.view-model.interface';
import { IMultilingualText } from './common';

export interface IDigitalTextViewModel extends IBaseViewModel {
    type: 'digitalText';

    title: IMultilingualText;

    isPublished: boolean;

    tags: ITagViewModel[];
}
