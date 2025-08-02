import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IDigitalTextPage } from './digital-text-page.interface';

export interface IDigitalTextPagesViewModel extends IBaseResourceViewModel {
    pages: IDigitalTextPage[];
}
