import { IBaseViewModel } from '../../base.view-model.interface';
import { MIMEType } from '../media-items';

export interface IAudioItemViewModel extends IBaseViewModel {
    name: string;

    audioURL: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;
}
