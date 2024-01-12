import { IBaseViewModel } from '../../base.view-model.interface';
import { ITagViewModel } from '../../tag.view-model.interface';
import { IMultilingualText } from '../common';
import { IDigitalTextPage } from './digital-text-page.interface';

export interface IDigitalTextViewModel extends IBaseViewModel {
    type: 'digitalText';

    title: IMultilingualText;

    isPublished: boolean;

    tags: ITagViewModel[];

    pages: IDigitalTextPage[];
}
