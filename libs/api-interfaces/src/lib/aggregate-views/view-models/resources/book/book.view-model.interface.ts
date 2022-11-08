import { IBaseViewModel } from '../../base.view-model.interface';
import { IBookPage } from './book-page.interface';

export interface IBookViewModel extends IBaseViewModel {
    title: string;

    subtitle?: string;

    author: string;

    publicationDate?: string;

    pages: IBookPage[];
}
