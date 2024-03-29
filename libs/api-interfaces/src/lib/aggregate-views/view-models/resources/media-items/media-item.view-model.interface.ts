import { IBaseViewModel } from '../../base.view-model.interface';
import { MIMEType } from './mime-type.enum';

export interface IMediaItemViewModel extends IBaseViewModel {
    title?: string;

    titleEnglish?: string;

    url: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;
}
