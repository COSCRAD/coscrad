import { IBaseViewModel } from '../../base.view-model.interface';
import { INoteViewModel } from '../../note';
import { IMultilingualText } from '../common/multilingual-text/multilingual-text.interface';
import { MIMEType } from '../media-items';

export interface IAudioItemViewModel extends IBaseViewModel {
    name: IMultilingualText;

    audioURL: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    /**
     * TODO Make this an ITranscript
     */
    text: string;

    /**
     * Just the notes that use time range context.
     */
    annotations: INoteViewModel[];
}
