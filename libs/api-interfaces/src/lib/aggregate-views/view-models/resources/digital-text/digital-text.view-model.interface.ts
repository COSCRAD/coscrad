import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { ITagViewModel } from '../../tag.view-model.interface';

export interface IDigitalTextViewModel extends IBaseResourceViewModel {
    type: 'digitalText';

    isPublished: boolean;

    tags: Pick<ITagViewModel, 'label' | 'id'>[];
}
