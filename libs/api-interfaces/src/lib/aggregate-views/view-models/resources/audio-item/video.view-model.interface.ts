import { IBaseViewModel } from '../../base.view-model.interface';
import { IMultilingualText } from '../common';
import { MIMEType } from '../media-items';
import { ITranscript } from './transcript.interface';

export interface IVideoViewModel extends IBaseViewModel {
    name: IMultilingualText;

    videoUrl: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    transcript: ITranscript;
}
