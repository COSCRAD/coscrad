import { IBaseViewModel } from '../base.view-model.interface';

export interface ITranscribedAudioViewModel extends IBaseViewModel {
    audioURL: string;

    start: number;

    lengthMilliseconds: number;

    /**
     * We may eventually want to make this a union of different
     * text representations, including three way translations.
     *
     * TODO We should decide what format is useful for our current
     * needs.
     */
    plainText: string;
}
