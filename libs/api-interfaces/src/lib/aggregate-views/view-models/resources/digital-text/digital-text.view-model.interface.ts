import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { ITagViewModel } from '../../tag.view-model.interface';
import { IDigitalTextPage } from './digital-text-page.interface';

export interface IDigitalTextViewModel extends IBaseResourceViewModel {
    type: 'digitalText';

    isPublished: boolean;

    tags: Pick<ITagViewModel, 'label' | 'id'>[];

    pages: IDigitalTextPage[];
}
