import { IBaseViewModel } from '../base.view-model.interface';
import { MIMEType } from './media-items';

export interface ITranscribedAudioViewModel extends IBaseViewModel {
    name: string;

    audioURL: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    /**
     * We may eventually want to make this a union of different
     * text representations, including three way translations.
     *
     * TODO We should decide what format is useful for our current
     * needs.
     */
    text: string;
}
