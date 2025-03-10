import { IBaseViewModel } from '../../base.view-model.interface';
import { MIMEType } from './mime-type.enum';

export interface IMediaItemViewModel extends IBaseViewModel {
    title?: string;

    titleEnglish?: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    url: string;
}
