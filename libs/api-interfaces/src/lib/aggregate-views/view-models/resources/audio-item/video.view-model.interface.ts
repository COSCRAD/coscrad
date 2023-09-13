import { IBaseViewModel } from '../../base.view-model.interface';
import { MIMEType } from '../media-items';
import { IMultilingualText } from './multilingual-text.interface';
import { ITranscript } from './transcript.interface';

export interface IVideoViewModel extends IBaseViewModel {
    name: IMultilingualText;

    videoUrl: string;

    mimeType: MIMEType;

    lengthMilliseconds: number;

    transcript: ITranscript;
}
