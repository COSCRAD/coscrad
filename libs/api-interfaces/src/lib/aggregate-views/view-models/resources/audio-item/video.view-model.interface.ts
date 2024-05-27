import { IBaseResourceViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common';
import { MIMEType } from '../media-items';
import { ITranscript } from './transcript.interface';

export interface IVideoViewModel extends IBaseResourceViewModel {
    name: IMultilingualText;

    videoUrl: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    transcript: ITranscript;
}
