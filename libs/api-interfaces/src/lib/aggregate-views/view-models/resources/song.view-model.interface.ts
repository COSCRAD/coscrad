import { IMultilingualTextRecord } from '.';
import { IBaseResourceViewModel } from '../base.view-model.interface';

export interface ISongViewModel extends IBaseResourceViewModel {
    // We'll want to replace the following two props with a single `MultilingualText`
    title?: string;

    titleEnglish?: string;

    // we may want to consider transcribed audio and three-way text for this
    lyrics?: IMultilingualTextRecord;

    audioURL: string;

    lengthMilliseconds: number;
}
