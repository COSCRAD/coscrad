import { IBaseViewModel } from '../base.view-model.interface';

export interface ISongViewModel extends IBaseViewModel {
    // We'll want to replace the following two props with a single `MultilingualText`
    title?: string;

    titleEnglish?: string;

    // we may want to consider transcribed audio and three-way text for this
    lyrics?: string;

    audioURL: string;

    lengthMilliseconds: number;

    // Is this really necessary?
    startMilliseconds: number;
}
