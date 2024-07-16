import { IBaseResourceViewModel } from '../base.view-model.interface';
import { MIMEType } from './media-items';

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    mediaItemId?: string;

    mimeType?: MIMEType;

    sourceProject?: string;
}
