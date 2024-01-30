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
     * Note that this is a denormalized property. We are taking a step down the
     * CQRS-ES path here.
     */
    annotations: INoteViewModel[];
}
