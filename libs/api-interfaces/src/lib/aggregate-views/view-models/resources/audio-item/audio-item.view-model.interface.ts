import { IBaseViewModel } from '../../base.view-model.interface';
import { MIMEType } from '../media-items';
import { IMultilingualText } from './multilingual-text.interface';

export interface IAudioItemViewModel extends IBaseViewModel {
    name: IMultilingualText;

    audioURL: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;
}
