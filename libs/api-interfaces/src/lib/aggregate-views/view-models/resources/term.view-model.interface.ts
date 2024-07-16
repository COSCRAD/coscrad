import { IBaseResourceViewModel } from '../base.view-model.interface';

export interface ITermViewModel extends IBaseResourceViewModel {
    audioURL?: string;

    mediaItemId?: string;

    // mimeType?: MIMEType; Do we want this?

    sourceProject?: string;
}
